import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import Text from 'ut-front-react/components/Text';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import ActionStatusButton from './../../../../components/ActionStatusButton';
import {closeAddToExistingBatchDialog, fetchBatches, changeBatch, checkApplication, setErrors} from './actions';
import {updateCloseRefetch} from './../actions';
import {openActionConfirmDialog} from './../ConfirmAction/actions';

import style from './../../style.css';
import cancelStyle from '../../../../components/ActionStatusButton/style.css';

import {validateAll, prepareErrors} from './../../../../helpers';
import {getAddToBatchBatchValidator} from './helpers';
import {getDialogTitle, titleStyle} from './../../../../components/ActionDialog/helpers';
import dialogStyles from './../../../../components/ActionDialog/style.css';

const tableColumns = [
    {title: 'Application Number', name: 'applicationId'},
    {title: 'customerName', name: 'customerName'},
    {title: 'Info', name: 'link'}
];

export class AddToExistingBatch extends Component {
    constructor(props) {
        super(props);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        if (!this.props.isOpen && nextProps.isOpen) {
            this.props.fetchBatches(nextProps.applications.getIn(['0', 'embossedTypeId']));
        }
    }
    handleAdd(actionData) {
        let validation = validateAll(this.props.store, getAddToBatchBatchValidator());
        if (!validation.isValid) {
            let createErrors = prepareErrors(validation.errors);
            this.props.setErrors(createErrors);
            return;
        }
        if (actionData.confirmationRequired) {
            this.props.openActionConfirmDialog(actionData);
            return;
        }
        let applications = this.props.checked.map((application) => {
            return application.set('batchId', this.props.batchId);
        });
        this.props.updateCloseRefetch(applications.toJS(), actionData.id);
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
              rowsChecked={this.props.checked.toJS()}
            />
        </div>;

        return grid;
    }
    renderDialogContent() {
        let {checked} = this.props;
        return <div className={style.contentWrapper}>
            <div>
                <div className={style.rowPaddings}>
                  <Dropdown
                    defaultSelected={this.props.batchId}
                    label={<span><Text>Batch</Text> *</span>}
                    boldLabel
                    placeholder={<Text>Select batch</Text>}
                    onSelect={this.props.changeBatch}
                    data={this.props.batches.toJS()}
                    keyProp='batchId'
                    isValid={this.props.errors.get('batchId') === undefined}
                    errorMessage={this.props.errors.get('batchId')}
                  />
                </div>
                <div className={style.countLabel}><span>{checked.size}</span> <Text>Applications added</Text></div>
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
            <ActionStatusButton page='application' currentStatuses={currentStatuses} action={actionsBylabel.AddToBatch} isHighlighted handleClick={this.handleAdd} padRight>
                {actionsBylabel.AddToBatch && actionsBylabel.AddToBatch.name}
            </ActionStatusButton>,
            <button onTouchTap={this.props.closeAddToExistingBatchDialog} className={cancelStyle.statusActionButton}><Text>Close</Text></button>
        ];
        return (
            <Dialog
              open={this.props.isOpen}
              autoScrollBodyContent
              title={getDialogTitle('Add To Existing Batch', this.props.closeAddToExistingBatchDialog)}
              titleStyle={titleStyle}
              actionsContainerClassName={dialogStyles.actionButtons}
              actions={actions}
            >
                {this.renderDialogContent()}
            </Dialog>
        );
    }
}

AddToExistingBatch.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    store: PropTypes.object.isRequired,
    actionsBylabel: PropTypes.object.isRequired,
    batchId: PropTypes.any,
    batches: PropTypes.object.isRequired,
    applications: PropTypes.object.isRequired,
    checked: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired,
    errors: PropTypes.object.isRequired,

    closeAddToExistingBatchDialog: PropTypes.func.isRequired,
    fetchBatches: PropTypes.func.isRequired,
    changeBatch: PropTypes.func.isRequired,
    checkApplication: PropTypes.func.isRequired,
    updateCloseRefetch: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    openActionConfirmDialog: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        isOpen: state.cardApplicationAddToExistingBatch.get('open'),
        store: state.cardApplicationAddToExistingBatch,
        actionsBylabel: state.utCardStatusAction.get('actions-application-by-label') || {},
        batchId: state.cardApplicationAddToExistingBatch.get('batchId'),
        batches: state.cardApplicationAddToExistingBatch.get('batches'),
        applications: state.cardApplicationAddToExistingBatch.get('applications'),
        checked: state.cardApplicationAddToExistingBatch.get('checked'),
        disabled: state.cardApplicationAddToExistingBatch.get('disabled'),
        errors: state.cardApplicationAddToExistingBatch.get('errors')
    };
}

export default connect(
    mapStateToProps,
    {closeAddToExistingBatchDialog, fetchBatches, changeBatch, checkApplication, updateCloseRefetch, setErrors, openActionConfirmDialog}
)(AddToExistingBatch);
