import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import Text from 'ut-front-react/components/Text';

import ActionStatusButtonsGroup from '../../../components/ActionStatusButtonsGroup';

import { toggleCardRelocation } from '../ActionDialogScreens/Relocate/actions';
import { toggleCardDetails } from '../ActionDialogScreens/Details/actions';

import { toggleActionWithReason } from '../ActionDialogScreens/ActionWithReason/actions';
import { toggleActionConfirmPrompt, confirmAction as updateStatus } from '../ActionDialogScreens/ConfirmAction/actions';

import { clearSelected } from '../Grid/actions';

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
            case 'Allocate':
                this.props.toggleCardRelocation();
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
        let { gridProps, toggleCardDetails, clearSelected, toolbox } = this.props;

        let currentSelected = gridProps.toList().toJS();
        let currentStatuses = currentSelected.reduce((prev, cur) => {
            if (!~prev.indexOf(cur.statusId)) {
                prev.push(cur.statusId);
            }
            return prev;
        }, []);

        let disabled = gridProps.size !== 1 ? 'disabled' : '';
        let excludedActions = [];
        let highlightedActions = [];
        if (!this.props.toolbox) {
            // in details
            highlightedActions = ['Accept', 'AcceptCards', 'ApproveCardAcceptance', 'ApproveDestruction', 'Allocate', 'Send'];
            if (currentSelected[0].statusLabel === 'RejectedAcceptance') {
                highlightedActions.splice(highlightedActions.findIndex((node) => { return node === 'AcceptCards'; }), 1);
            }
        }
        return (
            <div>
                {this.context.checkPermission('card.cardInProduction.get') && toolbox &&
                 <button style={{margin: '0 5px 0 0'}} className={disabled ? style.statusActionButtonDisabled : style.statusActionButton}
                   disabled={disabled} onTouchTap={() => { !disabled && toggleCardDetails(); }}>
                        <Text>Details</Text>
                 </button>
                }
                <ActionStatusButtonsGroup page='card' statusIds={currentStatuses} handleClick={this.handleAction} highlighted={highlightedActions} excludeActions={excludedActions} />
                {!toolbox && <button className={style.statusActionButton} onTouchTap={() => { clearSelected(); toggleCardDetails(); }}> <Text> Close </Text> </button>}
            </div>
        );
    }
};

ActionButtons.propTypes = {
    // data
    gridProps: PropTypes.object.isRequired,
    toolbox: PropTypes.bool,
    // actions
    toggleActionWithReason: PropTypes.func.isRequired,
    toggleActionConfirmPrompt: PropTypes.func.isRequired,
    toggleCardRelocation: PropTypes.func.isRequired,
    toggleCardDetails: PropTypes.func.isRequired,
    setCurrentAction: PropTypes.func.isRequired,
    clearSelected: PropTypes.func.isRequired,
    updateStatus: PropTypes.func.isRequired
};
ActionButtons.defaultProps = {
    toolbox: false
};
ActionButtons.contextTypes = {
    checkPermission: PropTypes.func.isRequired
};

export default connect(
    (state) => {
        return {
            gridProps: state.cardManagementGrid.get('selected').size > 0 ? state.cardManagementGrid.get('selected') : state.cardManagementGrid.get('checked')
        };
    },
    {toggleActionWithReason, toggleActionConfirmPrompt, toggleCardRelocation, toggleCardDetails, setCurrentAction, clearSelected, updateStatus}
)(ActionButtons);
