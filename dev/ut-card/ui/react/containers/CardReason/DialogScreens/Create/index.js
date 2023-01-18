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

import {toggle, create, set as onChange, fetchActions} from './actions';

import {getModules, parseModuleActions} from '../../helpers';

import buttonStyles from '../../../../components/ActionStatusButton/style.css';
import actionDialogStyles from '../../../../components/ActionDialog/style.css';
import dialogCommonStyles from '../style.css';

const action = {
    name: 'Create',
    label: 'createReason'
};

const moduleErrorMessage = 'Please select a module';
const actionsErrorMessage = 'Please select one or more actions';
const reasonNameErrorMessage = 'Please define reason';
const reasonNameMaxLength = 170;
const reasonNameLengthError = `Reason name should be less than ${reasonNameMaxLength} symbols`;

class CardReasonCreate extends Component {
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
            }
        };

        this.getTranslatedModules = this.getTranslatedModules.bind(this);
        this.validate = this.validate.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount() {
        let { actions, input, fetchActions } = this.props;
        if (!actions || !actions.size) {
            fetchActions();
        } else {
            let {dropdownData} = this.state;

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
        let { actions, input, fetchActions } = this.props;
        if (!actions || !actions.size) {
            fetchActions();
        } else {
            let {dropdownData} = this.state;

            if (dropdownData.modules.length === 0) {
                dropdownData.modules = this.getTranslatedModules(nextProps.actions);
            }
            if (dropdownData.actions.length === 0 || input.get('module') !== nextProps.input.get('module')) {
                dropdownData.actions = parseModuleActions(nextProps.input.get('module'), nextProps.actions);
            }

            this.setState({dropdownData: dropdownData});
        }
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

    handleChange(params) {
        let { onChange } = this.props;
        let { isValid } = this.state;

        onChange(params);

        let newState = Object.assign(isValid, {[params.key]: true});
        this.setState({isValid: newState});
    }

    render() {
        let { open, toggle, create, input } = this.props;
        let { isValid, dropdownData } = this.state;
        let title = 'Create Reason';

        let actionSelectDisabled = !input.get('module');

        let content = (
            <div>
                <div className={dialogCommonStyles.moduleWrap}>
                    <Dropdown
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
                      disabled={actionSelectDisabled}
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
                      label='Reason*'
                      keyProp='reasonName'
                      onChange={this.handleChange}
                      value={input.get('reasonName')}
                      isValid={isValid.reasonName}
                      errorMessage={(input.get('reasonName').length > reasonNameMaxLength) ? reasonNameLengthError : reasonNameErrorMessage} />
                </div>
                <div className={dialogCommonStyles.statusWrap}>
                    <RadioButton
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

        let actions = [
            <Button
              className={classnames(buttonStyles.statusActionButton, buttonStyles.highlighted, actionDialogStyles.actionDialogButton)}
              onTouchTap={() => { this.validate() && create(input); }}> <Text>{action.name}</Text> </Button>,
            <Button
              className={classnames(buttonStyles.statusActionButton, actionDialogStyles.actionDialogButton)}
              onTouchTap={toggle}> <Text> Close </Text> </Button>
        ];

        return (
            <Dialog
              actions={actions}
              title={title}
              open={open}
              onClose={toggle}
              externalMainContentWrapClass={dialogCommonStyles.contentWrap}>
                {content}
            </Dialog>
        );
    }
}

CardReasonCreate.propTypes = {
    // data
    open: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    input: PropTypes.object.isRequired,
    // actions
    toggle: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    fetchActions: PropTypes.func.isRequired
};

export default connect(({cardReasonCreateDialog, cardReasonGrid}) => ({
    open: cardReasonCreateDialog.get('open'),
    actions: cardReasonCreateDialog.get('actionList'),
    input: cardReasonCreateDialog.get('input')
}), {toggle, create, onChange, fetchActions})(CardReasonCreate);
