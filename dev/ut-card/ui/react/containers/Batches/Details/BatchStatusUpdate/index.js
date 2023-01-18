import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import ActionStatusConfirmationDialog from '../../../../components/ActionStatusConfirmationDialog';
import { toggleStatusUpdatePrompt, statusUpdateBatch } from './actions';
import {close as handleDetailsClose} from '../actions';

class BatchStatusUpdate extends Component {
    constructor(props) {
        super(props);
        this.mapActionLabelToId = this.mapActionLabelToId.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onCancel = this.onCancel.bind(this);
    }
    mapActionLabelToId(label) {
        return this.props.actionList.filter(function(value) {
            return value.label === label;
        }).pop().id;
    }
    onClick(action) {
        let batchGridData = this.props.checkedBatchItems.toList().toJS().pop();
        let editableValues = this.props.editableValues;
        let batchActionId = this.mapActionLabelToId(this.props.action.label);
        let namedBatch = this.props.namedBatch;
        let cardsCurrentBranchId = this.props.cardsAutoAllocationBusinessUnit;
        let batch = {
            batchId: editableValues.batchId || batchGridData.id,
            batchName: editableValues.batchName || batchGridData.batchName,
            statusId: editableValues.statusId || batchGridData.statusId,
            branchId: editableValues.branchId || parseInt(batchGridData.branchId),
            targetBranchId: editableValues.targetBranchId || parseInt(batchGridData.targetBranchId),
            namedBatch: namedBatch,

            issuingBranchId: !namedBatch ? (editableValues.issuingBranchId || parseInt(batchGridData.issuingBranchId)) : null,
            typeId: !namedBatch ? (editableValues.typeId || parseInt(batchGridData.typeId)) : null,
            numberOfCards: !namedBatch ? (editableValues.numberOfCards || parseInt(batchGridData.numberOfCards)) : null
        };
        this.props.statusUpdateBatch(batchActionId, this.props.action.label, batch, cardsCurrentBranchId);
        this.props.handleDetailsClose();
    };
    onCancel() {
        this.props.toggleStatusUpdatePrompt(this.props.action);
    };
    render() {
        let onClick = (action) => {
            this.onClick(action);
        };
        return (
            <ActionStatusConfirmationDialog
              page={'Batch'}
              open={this.props.opened}
              action={this.props.action}
              onSuccess={onClick}
              onCancel={this.onCancel} />
        );
    }
}

BatchStatusUpdate.propTypes = {
    actionList: PropTypes.array,
    opened: PropTypes.bool.isRequired,
    cardsAutoAllocationBusinessUnit: PropTypes.number,
    action: PropTypes.object.isRequired,
    namedBatch: PropTypes.bool,
    editableValues: PropTypes.object,
    // methods
    toggleStatusUpdatePrompt: PropTypes.func,
    handleDetailsClose: PropTypes.func,
    statusUpdateBatch: PropTypes.func,
    // data
    checkedBatchItems: PropTypes.object
};
export default connect(
    (state) => {
        let namedBatch;
        if (state.batchDetails.get('embossedTypeId') !== 0) {
            // call is from details popup
            namedBatch = state.batchDetails.get('embossedTypeId') === state.utCardStatusAction.get('embossedTypeIdNamed') ? true
                        : ((state.batchDetails.get('embossedTypeId') === state.utCardStatusAction.get('embossedTypeIdNoNamed')) ? false
                        : null);
        } else {
            // call is from grid
            let batchGridData = state.batchesGrid.get('checkedBatchItems').toList().toJS().pop();
            if (batchGridData && batchGridData.embossedTypeId) {
                namedBatch = batchGridData.embossedTypeId === state.utCardStatusAction.get('embossedTypeIdNamed') ? true
                        : ((batchGridData.embossedTypeId === state.utCardStatusAction.get('embossedTypeIdNoNamed')) ? false
                        : null);
            } else {
                namedBatch = null;
            };
        };
        return {
            actionList: state.utCardStatusAction.get('actions-batch') || [],
            opened: state.batchStatusUpdatePopup.get('opened'),
            cardsAutoAllocationBusinessUnit: state.batchDetails.get('cardsAutoAllocationBusinessUnit'),
            action: state.batchStatusUpdatePopup.get('action'),
            namedBatch: namedBatch,
            editableValues: {
                batchId: state.batchDetails.get('saveableValues').get('batchId'),
                statusId: state.batchDetails.get('saveableValues').get('statusId'),
                branchId: state.batchDetails.get('saveableValues').get('branchId'),

                targetBranchId: state.batchDetails.get('editableValues').get('targetBusinessUnit'),
                issuingBranchId: state.batchDetails.get('editableValues').get('issuingBusinessUnit'),
                typeId: state.batchDetails.get('editableValues').get('typeId'),
                batchName: state.batchDetails.get('editableValues').get('batchName'),
                numberOfCards: state.batchDetails.get('editableValues').get('numberOfCards')
            },
            checkedBatchItems: state.batchesGrid.get('checkedBatchItems')
        };
    }, {toggleStatusUpdatePrompt, statusUpdateBatch, handleDetailsClose}
)(BatchStatusUpdate);
