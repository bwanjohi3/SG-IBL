import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import MultiSelectDropdown from 'ut-front-react/components/Input/MultiSelectDropdown';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import RadioButton from 'ut-front-react/components/Input/Radio';
import TextArea from 'ut-front-react/components/Input/TextArea';
import Button from 'ut-front-react/components/Button';
import Text from 'ut-front-react/components/Text';

import Dialog from '../../../../components/ActionDialog';
import ConfirmationDialog from '../../../../components/ActionStatusConfirmationDialog';

import {toggle, edit, set as onChange, getReason, fetchActions} from './actions';
import {clearSelected} from '../../Grid/actions';

import {getModules, parseModuleActions} from '../../helpers';

import buttonStyles from '../../../../components/ActionStatusButton/style.css';
import actionDialogStyles from '../../../../components/ActionDialog/style.css';
import dialogCommonStyles from '../style.css';

const action = {
    name: 'Save Changes',
    label: 'editReason'
};
const confirmationMessage = 'Are you sure you want to save changes?';

const moduleErrorMessage = 'Please select a module';
const actionsErrorMessage = 'Please select one or more actions';
const reasonNameErrorMessage = 'Please define reason';
const reasonNameMaxLength = 170;
const reasonNameLengthError = `Reason name should be less than ${reasonNameMaxLength} symbols`;

class CardReasonEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmationOpen: false,
            isValid: {
                module: true,
                actions: true,
                reasonName: true
            },
            dropdownData: {
                modules: [],
                actions: []
            },
            editDisabled: true
        };

        this.getTranslatedModules = this.getTranslatedModules.bind(this);
        this.validate = this.validate.bind(this);
        this.openConfirmation = this.openConfirmation.bind(this);
        this.closeConfirmation = this.closeConfirmation.bind(this);
        this.renderConfirmation = this.renderConfirmation.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount() {
        let { selected, checked, actions, input, fetchActions, getReason, clearSelected } = this.props;

        let id = (selected.getIn([0, 'reasonId']) || checked.getIn([0, 'reasonId']));
        if (id) {
            getReason(id);
            clearSelected();
        }

        if (!actions.size) {
            fetchActions();
        } else {
            let { dropdownData } = this.state;
            if (dropdownData.modules.length === 0) {
                dropdownData.modules = this.getTranslatedModules(actions);
            }
            if (dropdownData.actions.length === 0) {
                dropdownData.actions = parseModuleActions(input.get('module'), actions);
            }
            this.setState({dropdownData: dropdownData});
        }
    }

    componentWillReceiveProps(nextProps) {
        let { editChangeId, input } = this.props;
        let { dropdownData, editDisabled } = this.state;

        if (nextProps.editChangeId !== editChangeId) {
            editDisabled = false;
        }
        if (dropdownData.modules.length === 0) {
            dropdownData.modules = this.getTranslatedModules(nextProps.actions);
        }
        if (dropdownData.actions.length === 0 || input.get('module') !== nextProps.input.get('module')) {
            dropdownData.actions = parseModuleActions(nextProps.input.get('module'), nextProps.actions);
        }

        this.setState({dropdownData: dropdownData, editDisabled: editDisabled});
    }

    getTranslatedModules(actions) {
        return getModules(actions).map(item => {
            return {
                key: item.key,
                name: <Text>{item.name}</Text>
            };
        });
    }

    validate() {
        let { input } = this.props;

        let isModuleValid = input.get('module') !== '';
        let isActionsValid = input.get('actions').size > 0;
        let isReasonNameValid = input.get('reasonName').trim() !== '' && input.get('reasonName').length < reasonNameMaxLength;

        this.setState({isValid: {
            module: isModuleValid,
            actions: isActionsValid,
            reasonName: isReasonNameValid
        }});

        return isModuleValid && isActionsValid && isReasonNameValid;
    }

    openConfirmation() {
        if (!this.validate()) {
            return;
        }
        this.setState({
            confirmationOpen: true
        });
    }

    closeConfirmation() {
        this.setState({
            confirmationOpen: false
        });
    }

    renderConfirmation() {
        let { edit, input } = this.props;
        let onSuccess = () => {
            edit(input);
            this.closeConfirmation();
        };
        let onCancel = () => {
            this.closeConfirmation();
        };

        return (
            <ConfirmationDialog
              open={this.state.confirmationOpen}
              onSuccess={onSuccess}
              onCancel={onCancel}
              action={action}
              confirmationMessage={confirmationMessage} />
        );
    }

    handleChange(params) {
        let { onChange } = this.props;
        let {isValid} = this.state;

        onChange(params);

        let newState = Object.assign(isValid, {[params.key]: true});
        this.setState({isValid: newState});
    }

    render() {
        let { open, toggle, isDataLoading, input } = this.props;

        if (isDataLoading) {
            return null;
        }

        let { isValid, dropdownData, editDisabled, confirmationOpen } = this.state;

        let title = 'Edit Reason';

        let actionSelectDisabled = !input.get('module');
        let hasEditPermission = this.context.checkPermission('card.reason.edit');

        let content = (
            <div>
                <div className={dialogCommonStyles.moduleWrap}>
                    <Dropdown
                      disabled={!hasEditPermission}
                      label='Module*'
                      boldLabel
                      placeholder='Select Module'
                      keyProp='module'
                      onSelect={this.handleChange}
                      data={dropdownData.modules}
                      defaultSelected={input.get('module')}
                      isValid={isValid.module}
                      errorMessage={moduleErrorMessage} />
                </div>
                    <div className={dialogCommonStyles.actionWrap} onClick={() => { actionSelectDisabled && this.setState({isValid: Object.assign(isValid, {module: false})}); }}>
                    <MultiSelectDropdown
                      disabled={!hasEditPermission}
                      label='Actions*'
                      boldLabel
                      placeholder='Select Actions'
                      keyProp='actions'
                      onSelect={this.handleChange}
                      data={dropdownData.actions}
                      defaultSelected={input.get('actions').toJS()}
                      isValid={isValid.actions}
                      errorMessage={actionsErrorMessage} />
                </div>
                <div className={dialogCommonStyles.reasonNameWrap}>
                    <TextArea
                      disabled={!hasEditPermission}
                      label='Reason*'
                      keyProp='reasonName'
                      onChange={this.handleChange}
                      value={input.get('reasonName')}
                      isValid={isValid.reasonName}
                      errorMessage={input.get('reasonName').length > reasonNameMaxLength ? reasonNameLengthError : reasonNameErrorMessage} />
                </div>
                <div className={dialogCommonStyles.statusWrap}>
                    <RadioButton
                      disabled={!hasEditPermission}
                      label={'Status*'}
                      boldLabel
                      defaultValue={input.get('isActive')}
                      onChange={this.handleChange}
                      options={[
                        {id: 1, name: 'isActive', label: 'Active', value: 1},
                        {id: 0, name: 'isActive', label: 'Inactive', value: 0}
                      ]} />
                </div>
            </div>
        );

        let buttonClassNames = (editDisabled || !hasEditPermission) ? buttonStyles.statusActionButtonDisabled : buttonStyles.highlighted;

        let actions = [
            <Button
              className={classnames(buttonStyles.statusActionButton, actionDialogStyles.actionDialogButton)}
              onTouchTap={toggle}> <Text>Close</Text>
            </Button>
        ];
        if (hasEditPermission) {
            let saveBtn = <Button
              className={classnames(buttonStyles.statusActionButton, actionDialogStyles.actionDialogButton, buttonClassNames)}
              disabled={editDisabled || !hasEditPermission}
              onTouchTap={!editDisabled && hasEditPermission && this.openConfirmation}>
                <Text>{action.name}</Text>
            </Button>;
            actions.unshift(saveBtn);
        }
        return (
            <Dialog
              actions={actions}
              title={title}
              open={open}
              onClose={toggle}
              externalMainContentWrapClass={dialogCommonStyles.contentWrap}>
                {content}
                {confirmationOpen && this.renderConfirmation()}
            </Dialog>
        );
    }
}

CardReasonEdit.propTypes = {
    // data
    checked: PropTypes.object.isRequired, // immutable list
    selected: PropTypes.object.isRequired, // immutable map
    open: PropTypes.bool.isRequired,
    editChangeId: PropTypes.number.isRequired,
    actions: PropTypes.object.isRequired,
    input: PropTypes.object.isRequired,
    isDataLoading: PropTypes.bool.isRequired,
    // actions
    toggle: PropTypes.func.isRequired,
    getReason: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    clearSelected: PropTypes.func.isRequired,
    fetchActions: PropTypes.func.isRequired
};

CardReasonEdit.contextTypes = {
    checkPermission: PropTypes.func.isRequired
};

export default connect(({cardReasonEditDialog, cardReasonGrid, utCardStatusAction}) => ({
    checked: cardReasonGrid.get('checked'),
    selected: cardReasonGrid.get('selected'),
    open: cardReasonEditDialog.get('open'),
    editChangeId: cardReasonEditDialog.get('editChangeId'),
    actions: cardReasonEditDialog.get('actionList'),
    input: cardReasonEditDialog.get('input'),
    isDataLoading: cardReasonEditDialog.get('isDataLoading')
}), {toggle, edit, getReason, onChange, clearSelected, fetchActions})(CardReasonEdit);
