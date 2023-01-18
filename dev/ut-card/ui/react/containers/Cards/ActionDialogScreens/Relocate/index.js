import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';

import ActionDialog from '../../../../components/ActionDialog';

import Button from 'ut-front-react/components/Button';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Text from 'ut-front-react/components/Text';

import { set as handleSelect, toggleCardRelocation, fetch, relocate, clear } from './actions';
import { toggleCardDetails } from '../Details/actions';
import { parseRequestParams } from './helpers';

import buttonStyles from '../../../../components/ActionStatusButton/style.css';
import actionDialogStyles from '../../../../components/ActionDialog/style.css';
import popupCommonStyles from '../style.css';

const targetBranchErrorMessage = 'Please select a destination business unit';

class CardRelocation extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.validateInput = this.validateInput.bind(this);

        // initial value is true so we dont get error when initializing screen
        this.isTargetBranchValid = true;

        this.state = {
            isInputValid: false,
            confirmationOpen: false
        };
    }
    componentWillMount() {
        if (!this.props.businessUnits.size) {
            this.props.fetch();
        }
    }
    onChange(changedObj) {
        this.isTargetBranchValid = changedObj.value > 0;
        this.setState({isInputValid: this.isTargetBranchValid});

        this.props.handleSelect(changedObj);
    }
    validateInput() {
        this.isTargetBranchValid = this.props.inputBusinessUnitId > 0;
        this.setState({isInputValid: this.isTargetBranchValid});

        return this.isTargetBranchValid;
    }

    render() {
        let onSuccess = () => {
            this.validateInput();
            if (this.state.isInputValid) {
                let targetBranchId = this.props.inputBusinessUnitId | 0;
                let actionId = this.props.currentAction.get('id') | 0;
                let cardData = parseRequestParams(this.props.cards, targetBranchId);

                this.props.relocate({cardActionId: actionId, card: cardData});

                if (this.props.detailsPopupOpen) {
                    this.props.toggleCardDetails();
                }
            }
        };
        let onCancel = () => {
            this.props.clear();
        };
        let actions = [
            <Button
              className={classnames(buttonStyles.statusActionButton, buttonStyles.highlighted, actionDialogStyles.actionDialogButton)}
              onTouchTap={onSuccess}> <Text> Allocate </Text> </Button>,
            <Button
              className={classnames(buttonStyles.statusActionButton, actionDialogStyles.actionDialogButton)}
              onTouchTap={onCancel}> <Text> Cancel </Text> </Button>
        ];
        let title = 'Allocate Card to Business Unit';
        let content = (
            <div>
                <Dropdown
                  errorMessage={targetBranchErrorMessage}
                  isValid={this.isTargetBranchValid}
                  placeholder='Business Units'
                  keyProp='businessUnitId'
                  onSelect={this.onChange}
                  data={this.props.businessUnits.toJS()}
                  defaultSelected={this.props.inputBusinessUnitId > 0 ? this.props.inputBusinessUnitId : undefined}
                />
            </div>
        );
        return (
            <ActionDialog
              externalMainContentWrapClass={popupCommonStyles.contentWrap}
              actions={actions}
              title={title}
              open={this.props.open}
              onClose={onCancel}>
                {content}
                {this.state.confirmationOpen && this.getConfirmDialog()}
            </ActionDialog>
        );
    }
}

CardRelocation.propTypes = {
    // data
    open: PropTypes.bool.isRequired,
    detailsPopupOpen: PropTypes.bool.isRequired,
    cards: PropTypes.object.isRequired, // immutable list
    businessUnits: PropTypes.object.isRequired, // immutable list
    inputBusinessUnitId: PropTypes.number.isRequired,
    currentAction: PropTypes.object.isRequired, // immutable map

    // actions
    toggleCardRelocation: PropTypes.func.isRequired,
    toggleCardDetails: PropTypes.func.isRequired,
    handleSelect: PropTypes.func.isRequired,
    fetch: PropTypes.func.isRequired,
    relocate: PropTypes.func.isRequired,
    clear: PropTypes.func.isRequired
};

export default connect(({ cardRelocationPopup, cardManagementGrid, cardDetailsPopup, cardManagementActionButtons }) => ({
    open: cardRelocationPopup.get('open'),
    detailsPopupOpen: cardDetailsPopup.get('open'),
    cards: cardManagementGrid.get('selected').size > 0 ? cardManagementGrid.get('selected') : cardManagementGrid.get('checked'),
    businessUnits: cardRelocationPopup.get('businessUnits'),
    inputBusinessUnitId: cardRelocationPopup.get('businessUnitId'),
    currentAction: cardManagementActionButtons.get('currentAction')
}),
{toggleCardRelocation, toggleCardDetails, handleSelect, fetch, relocate, clear})(CardRelocation);
