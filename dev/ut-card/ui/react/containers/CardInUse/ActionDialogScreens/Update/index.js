import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { toggleCardUpdate, update, setAccountErrors, onReasonChange } from './actions';
import { close as closeDetails } from '../../Details/actions';
import { parseCardsRequestParams, parseLinkedAccountsRequestParams } from './helpers';
import { validateAccounts, prepareAttachmentsToUpdate } from '../../../helpers';

import ActionStatusWithReasonDialog from '../../../../components/ActionStatusWithReasonDialog';
import ActionStatusConfirmationDialog from '../../../../components/ActionStatusConfirmationDialog';

import popupCommonStyles from '../style.css';

class Update extends Component {
    componentWillMount() {
        let errors = validateAccounts(this.props.unlinkedAccounts, this.props.linkedAccounts);
        if (errors.size > 0) {
            this.props.setAccountErrors(errors);
        }
    }
    render() {
        let onSuccess = () => {
            let actionId = this.props.currentAction.get('id') | 0;
            let attachments = prepareAttachmentsToUpdate(this.props.attachments);

            this.props.update({
                cardActionId: actionId,
                card: parseCardsRequestParams(this.props.cards, this.props.inputReason),
                accounts: parseLinkedAccountsRequestParams(this.props.linkedAccounts),
                attachment: attachments.get('attachment').toJS(),
                newAttachments: attachments.get('newAttachments').toJS(),
                document: attachments.get('document').toJS()
            });

            if (this.props.detailsOpen) {
                this.props.closeDetails();
            }
        };
        let onClose = () => {
            this.props.toggleCardUpdate();
        };
        let reasonRequired = this.props.currentAction.get('reasonRequired');
        let confirmationRequired = this.props.currentAction.get('confirmationRequired');

        if (reasonRequired) {
            return (
                <ActionStatusWithReasonDialog
                  action={this.props.currentAction.toJS()}
                  open={this.props.open}
                  onSuccess={onSuccess}
                  onClose={onClose}
                  onChange={this.props.onReasonChange}
                  page={'cardInUse'} />
            );
        } else if (confirmationRequired) {
            return (
                <ActionStatusConfirmationDialog
                  page={'CardInUse'}
                  externalMainContentWrapClass={popupCommonStyles.contentWrap}
                  open={this.props.open}
                  action={this.props.currentAction.toJS()}
                  onSuccess={onSuccess}
                  onCancel={onClose} />
            );
        } else {
            onSuccess();
            return null;
        }
    }
};

Update.propTypes = {
    // Data
    open: PropTypes.bool.isRequired,
    detailsOpen: PropTypes.bool.isRequired,
    cards: PropTypes.object.isRequired, // immutable list
    linkedAccounts: PropTypes.object.isRequired, // immutable list
    unlinkedAccounts: PropTypes.object.isRequired, // immutable list
    currentAction: PropTypes.object.isRequired, // immutable map
    attachments: PropTypes.object.isRequired, // immutable list
    inputReason: PropTypes.object.isRequired, // immutable map
    // Actions
    toggleCardUpdate: PropTypes.func.isRequired,
    closeDetails: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    setAccountErrors: PropTypes.func.isRequired,
    onReasonChange: PropTypes.func.isRequired
};

export default connect(({cardInUseDetails, cardInUseGrid, cardInUseUpdatePopup, cardsInUseActionButtons, cardInUseAccount, cardInUseDocument}) => ({
    open: cardInUseUpdatePopup.get('open'),
    detailsOpen: cardInUseDetails.get('id') > 0,
    currentAction: cardsInUseActionButtons.get('currentAction'),
    cards: cardInUseDetails.get('id') > 0 ? cardInUseDetails.get('cardInfo') : cardInUseGrid.get('checkedRows'),
    inputReason: cardInUseUpdatePopup.get('reason'),
    linkedAccounts: cardInUseAccount.getIn(['data', 'linked']),
    unlinkedAccounts: cardInUseAccount.getIn(['data', 'unlinked']),
    attachments: cardInUseDocument.get('attachments')
}), { toggleCardUpdate, closeDetails, update, setAccountErrors, onReasonChange })(Update);
