import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import Text from 'ut-front-react/components/Text';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Input from 'ut-front-react/components/Input';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import ActionStatusButton from './../../../../components/ActionStatusButton';

import style from './../../style.css';
import cancelStyle from '../../../../components/ActionStatusButton/style.css';

import {getDialogTitle, titleStyle} from './../../../../components/ActionDialog/helpers';
import dialogStyles from './../../../../components/ActionDialog/style.css';

import {validateAll, prepareErrors} from './../../../../helpers';
import {getBatchNameValidationRules, getCreateBatchValidator} from './helpers';
import {closeCreateBatchDialog, fetchBusinessUnits, changeBatchName, changeBusinessUnit, checkApplication, setErrors} from './actions';
import {updateCloseRefetch} from './../actions';
import {openActionConfirmDialog} from './../ConfirmAction/actions';

const tableColumns = [
    {title: 'Application Number', name: 'applicationId'},
    {title: 'customerName', name: 'customerName'},
    {title: 'Info', name: 'link'}
];

const batchNameValidations = getBatchNameValidationRules();

export class BatchCreate extends Component {
    constructor(props) {
        super(props);
        this.closeCreateBatchDialog = this.closeCreateBatchDialog.bind(this);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        if (!this.props.isOpen && nextProps.isOpen) {
            this.props.fetchBusinessUnits();
        }
    }
    handleCreate(actionData) {
        let validation = validateAll(this.props.createBatchStore, getCreateBatchValidator());
        if (!validation.isValid) {
            let createErrors = prepareErrors(validation.errors);
            this.props.setErrors(createErrors);
            return;
        }
        if (actionData.confirmationRequired) {
            this.props.openActionConfirmDialog(actionData);
            return;
        }
        let applications = this.props.checked.toList().toJS();
        let batch = {
            targetBranchId: this.props.targetBranchId,
            batchName: this.props.batchName
        };
        this.props.updateCloseRefetch(applications, actionData.id, batch);
    }
    closeCreateBatchDialog(e) {
        this.props.closeCreateBatchDialog();
    }
    handleCheckboxSelect(currentState, row, idx) {
        this.props.checkApplication(idx, row, currentState);
    }
    renderApplicationsGrid() {
        let multiSelect = !this.props.disabled;
        let grid = <div className={style.popupGridContainer}>
            <SimpleGrid
              hideHeader
              multiSelect={multiSelect}
              handleCheckboxSelect={this.handleCheckboxSelect}
              fields={tableColumns}
              data={this.props.applications.toJS()}
              rowsChecked={this.props.checked.toList().toJS()}
            />
        </div>;

        return grid;
    }
    renderDialogContent() {
        let {checked} = this.props;
        return <div className={style.contentWrapper}>
            <div>
                <div className={style.rowPaddings}>
                    <Input
                      value={this.props.batchName}
                      label={<Text>Batch Name</Text>}
                      boldLabel
                      placeholder={this.context.translate('Please enter batch name')}
                      keyProp='batchName'
                      validators={batchNameValidations}
                      isValid={this.props.errors.get('batchName') === undefined}
                      errorMessage={this.props.errors.get('batchName')}
                      onChange={this.props.changeBatchName} />
                </div>
                <div className={style.rowPaddings}>
                  <Dropdown
                    defaultSelected={this.props.targetBranchId}
                    label={<span><Text>Target Business Unit</Text> *</span>}
                    boldLabel
                    placeholder={<Text>Business Unit</Text>}
                    keyProp='targetBranchId'
                    isValid={this.props.errors.get('targetBranchId') === undefined}
                    errorMessage={this.props.errors.get('targetBranchId')}
                    onSelect={this.props.changeBusinessUnit}
                    data={this.props.businessUnits.toJS()}
                  />
                </div>
                <div className={style.countLabel}><span>{checked.size}</span> Applications added</div>
                {this.props.errors.get('checked') && <div className={style.errorWrap}> <div className={style.errorMessage}>{this.props.errors.get('checked')}</div></div>}
                <div>
                    {this.renderApplicationsGrid()}
                </div>
            </div>
        </div>;
    }
    render() {
        let {actionsBylabel} = this.props;
        let currentStatuses = this.props.applications.toJS().reduce((prev, cur) => {
            if (!~prev.indexOf(cur.statusId)) {
                prev.push(cur.statusId);
            }
            return prev;
        }, []);
        const actions = [
            <ActionStatusButton page='application' currentStatuses={currentStatuses} action={actionsBylabel.CreateBatch} isHighlighted handleClick={this.handleCreate} padRight>
                {actionsBylabel.CreateBatch && actionsBylabel.CreateBatch.name}
            </ActionStatusButton>,
            <button onTouchTap={this.closeCreateBatchDialog} className={cancelStyle.statusActionButton}><Text>Close</Text></button>
        ];
        return (
            <Dialog
              open={this.props.isOpen}
              autoScrollBodyContent
              title={getDialogTitle('Create Batch', this.closeCreateBatchDialog)}
              titleStyle={titleStyle}
              actionsContainerClassName={dialogStyles.actionButtons}
              actions={actions}
            >
                {this.renderDialogContent()}
            </Dialog>
        );
    }
}

BatchCreate.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    createBatchStore: PropTypes.object.isRequired,
    actionsBylabel: PropTypes.object.isRequired,
    batchName: PropTypes.string.isRequired,
    targetBranchId: PropTypes.string.isRequired,
    businessUnits: PropTypes.object.isRequired,
    applications: PropTypes.object.isRequired,
    checked: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired,
    errors: PropTypes.object.isRequired,
    closeCreateBatchDialog: PropTypes.func.isRequired,
    fetchBusinessUnits: PropTypes.func.isRequired,
    changeBatchName: PropTypes.func.isRequired,
    changeBusinessUnit: PropTypes.func.isRequired,
    checkApplication: PropTypes.func.isRequired,
    updateCloseRefetch: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    openActionConfirmDialog: PropTypes.func.isRequired
};

BatchCreate.contextTypes = {
    translate: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    return {
        isOpen: state.cardApplicationCreateBatch.get('open'),
        createBatchStore: state.cardApplicationCreateBatch,
        actionsBylabel: state.utCardStatusAction.get('actions-application-by-label') || {},
        batchName: state.cardApplicationCreateBatch.get('batchName'),
        businessUnits: state.cardApplicationCreateBatch.get('businessUnits'),
        targetBranchId: state.cardApplicationCreateBatch.get('targetBranchId'),
        applications: state.cardApplicationCreateBatch.get('applications'),
        checked: state.cardApplicationCreateBatch.get('checked'),
        disabled: state.cardApplicationCreateBatch.get('disabled'),
        errors: state.cardApplicationCreateBatch.get('errors')
    };
}

export default connect(
    mapStateToProps,
    {closeCreateBatchDialog, fetchBusinessUnits, changeBatchName, changeBusinessUnit, checkApplication, updateCloseRefetch, setErrors, openActionConfirmDialog}
)(BatchCreate);
