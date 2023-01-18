import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import Text from 'ut-front-react/components/Text';

import ActionStatusButtonsGroup from '../../../components/ActionStatusButtonsGroup';

import {fetch as fetchDetails, close as closeDetails} from '../Details/actions';
import {toggleActionConfirmPrompt, confirmAction as updateStatus} from '../ActionDialogScreens/ConfirmAction/actions';
import {toggleActionWithReason} from '../ActionDialogScreens/ActionWithReason/actions';
import {toggleCardUpdate} from '../ActionDialogScreens/Update/actions';

import {set as setCurrentAction} from './actions';

import {parseCardsRequestParams} from '../ActionDialogScreens/helpers';

import style from '../../../components/ActionStatusButton/style.css';

class ActionButtons extends Component {
    constructor(props) {
        super(props);
        this.handleAction = this.handleAction.bind(this);
    }
    handleAction(action) {
        this.props.setCurrentAction(action);
        switch (action.label) {
            case 'Update':
                this.props.toggleCardUpdate();
                break;
            default:
                if (action.reasonRequired) {
                    this.props.toggleActionWithReason();
                } else if (action.confirmationRequired) {
                    this.props.toggleActionConfirmPrompt();
                } else {
                    this.props.updateStatus({cardActionId: action.id, card: parseCardsRequestParams(this.props.gridProps)});
                }
                break;
        }
    }
    render() {
        let { gridProps, toolbox } = this.props;
        let currentSelected = gridProps.toList().toJS();
        let currentStatuses = currentSelected.reduce((prev, cur) => {
            if (!~prev.indexOf(cur.statusId)) {
                prev.push(cur.statusId);
            }
            return prev;
        }, []);
        let detailsDisabled = gridProps.size !== 1 ? 'disabled' : '';

        let cardToFetch = currentSelected[0];
        let cardToFetchId = cardToFetch && cardToFetch.cardId;

        let excludedActions = this.props.excluded.length > 0 ? this.props.excluded : [];
        let highlightedActons = this.props.highlighted.length > 0 ? this.props.highlighted : [];
        let disabledActions = this.props.disabled.length > 0 ? this.props.disabled : [];

        if (this.props.toolbox) {
            excludedActions = excludedActions.length > 0 ? excludedActions : ['Update', 'ResetPINRetries', 'RejectActivation', 'ApproveActivate', 'ApproveDeactivation', 'ApproveDestruction', 'RejectDestruction'];
        } else {
            // in details
            highlightedActons = highlightedActons.length > 0 ? highlightedActons : ['Update', 'ApproveDeactivation', 'ApproveDestruction', 'Activate', 'ApproveActivate'];
            if (cardToFetch.statusLabel === 'PendingDeactivation') {
                highlightedActons.splice(highlightedActons.findIndex((node) => { return node === 'Activate'; }), 1);
            }
        }

        return (
            <div>
                {this.context.checkPermission('card.cardInUse.get') && toolbox &&
                 <button style={{margin: '0 5px 0 0'}} className={detailsDisabled ? style.statusActionButtonDisabled : style.statusActionButton}
                   disabled={detailsDisabled}
                   onTouchTap={() => { !detailsDisabled && this.props.fetchDetails(cardToFetchId); }}>
                        <Text>Details</Text>
                 </button>
                }
                <ActionStatusButtonsGroup page='cardInUse' statusIds={currentStatuses} handleClick={this.handleAction} highlighted={highlightedActons} excludeActions={excludedActions} disabled={disabledActions} />
                {!toolbox && <button onTouchTap={this.props.closeDetails} className={style.statusActionButton}><Text>Close</Text></button>}
            </div>
        );
    }
};

ActionButtons.propTypes = {
    toolbox: PropTypes.bool,
    gridProps: PropTypes.object.isRequired,
    highlighted: PropTypes.array,
    disabled: PropTypes.array,
    excluded: PropTypes.array,

    fetchDetails: PropTypes.func.isRequired,
    closeDetails: PropTypes.func.isRequired,
    setCurrentAction: PropTypes.func.isRequired,
    toggleCardUpdate: PropTypes.func.isRequired,
    toggleActionConfirmPrompt: PropTypes.func.isRequired,
    toggleActionWithReason: PropTypes.func.isRequired,
    updateStatus: PropTypes.func.isRequired
};
ActionButtons.defaultProps = {
    toolbox: false,
    highlighted: [],
    disabled: [],
    excluded: []
};

ActionButtons.contextTypes = {
    checkPermission: PropTypes.func.isRequired
};

export default connect(
    (state) => {
        return {
            gridProps: state.cardInUseDetails.get('id') > 0 ? state.cardInUseDetails.get('cardInfo') : state.cardInUseGrid.get('checkedRows')
        };
    },
    {fetchDetails, closeDetails, setCurrentAction, toggleCardUpdate, toggleActionConfirmPrompt, toggleActionWithReason, updateStatus}
)(ActionButtons);
