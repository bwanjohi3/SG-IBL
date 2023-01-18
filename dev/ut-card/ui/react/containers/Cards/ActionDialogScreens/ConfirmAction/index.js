import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import ActionStatusConfirmationDialog from '../../../../components/ActionStatusConfirmationDialog';

import { toggleActionConfirmPrompt, confirmAction } from './actions';
import { toggleCardDetails } from '../Details/actions';
import { parseCardsRequestParams } from '../helpers';

import popupCommonStyles from '../style.css';

class ConfirmAction extends Component {
    render() {
        let { open, detailsPopupOpen, cards, currentAction, toggleCardDetails, toggleActionConfirmPrompt, confirmAction } = this.props;

        let onAccept = () => {
            let actionId = currentAction.get('id') | 0;
            let actionLabel = currentAction.get('label');

            confirmAction({cardActionId: actionId, cardActionLabel: actionLabel, card: parseCardsRequestParams(cards)});
            if (detailsPopupOpen) {
                toggleCardDetails();
            }
        };
        let onClose = () => {
            toggleActionConfirmPrompt();
        };

        return (
            <ActionStatusConfirmationDialog
              page={'Card'}
              externalMainContentWrapClass={popupCommonStyles.contentWrap}
              open={open}
              action={currentAction.toJS()}
              onSuccess={onAccept}
              onCancel={onClose} />
        );
    }
}

ConfirmAction.propTypes = {
    // data
    currentAction: PropTypes.object.isRequired, // immutable map
    cards: PropTypes.object.isRequired, // immutable list
    open: PropTypes.bool.isRequired,
    detailsPopupOpen: PropTypes.bool.isRequired,
    // actions
    toggleActionConfirmPrompt: PropTypes.func.isRequired,
    toggleCardDetails: PropTypes.func.isRequired,
    confirmAction: PropTypes.func.isRequired
};

export default connect(({ cardConfirmActionPopup, cardDetailsPopup, cardManagementGrid, cardManagementActionButtons }) => ({
    currentAction: cardManagementActionButtons.get('currentAction'),
    cards: cardManagementGrid.get('selected').size > 0 ? cardManagementGrid.get('selected') : cardManagementGrid.get('checked'),
    open: cardConfirmActionPopup.get('open'),
    detailsPopupOpen: cardDetailsPopup.get('open')
}),
{toggleActionConfirmPrompt, toggleCardDetails, confirmAction})(ConfirmAction);
