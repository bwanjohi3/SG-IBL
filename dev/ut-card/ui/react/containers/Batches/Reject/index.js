import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
// import Dialog from 'material-ui/Dialog';
import ActionStatusWithReasonDialog from '../../../components/ActionStatusWithReasonDialog';
// import DropdownSelect from 'ut-front-react/components/Input/Dropdown';
// import style from './style.css';
// import TextArea from 'ut-front-react/components/Input/TextArea';
// import Text from 'ut-front-react/components/Text';
import { toggleRejectBatchPopup, rejectBatch, update } from './actions';
import {close as handleDetailsClose} from '../Details/actions';
// import cancelStyle from '../../../components/ActionStatusButton/style.css';

class RejectDetails extends Component {
    constructor(props) {
        super(props);
        this.handleCancelButtonClick = this.handleCancelButtonClick.bind(this);
        this.onSuccess = this.onSuccess.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onChange = this.onChange.bind(this);
        this.mapActionLabelToId = this.mapActionLabelToId.bind(this);
    }

    handleCancelButtonClick(event) {
      //  this.props.toggleDetailsBatchPopup(this.props.batchId);
        this.props.toggleRejectBatchPopup();
    }
    mapActionLabelToId(label) {
        var result;
        this.props.actionList.forEach(function(value) {
            if (value.label === label) {
                result = value.id;
            }
        });
        return result;
    }
    onSuccess(action) {
        if (this.props.reasonId === undefined || this.props.reasonId === 0 || this.props.reasonId === '') {
            return;
        }
        let batchGridData = this.props.checkedBatchItems.toList().toJS().pop();
        let dataEditable = this.props.editableValues.toJS();
        let dataSaveable = this.props.saveableValues.toJS();
        let batchActionId = this.mapActionLabelToId(this.props.action.label);
        let namedBatch = this.props.namedBatch;
        let batch = {
            batchId: dataSaveable.batchId,
            batchName: dataEditable.batchName,
            statusId: dataSaveable.statusId,
            branchId: dataSaveable.branchId,
            targetBranchId: dataEditable.targetBusinessUnit,
            namedBatch: namedBatch,

            issuingBranchId: !namedBatch ? (dataEditable.issuingBusinessUnit || parseInt(batchGridData.issuingBranchId)) : null,
            typeId: !namedBatch ? (dataEditable.typeId || parseInt(batchGridData.typeId)) : null,
            numberOfCards: !namedBatch ? (dataEditable.numberOfCards || parseInt(batchGridData.numberOfCards)) : null,

            reasonId: this.props.reasonId
        };

        if (this.props.comment !== null && this.props.comment !== '') {
            batch.comments = this.props.comment;
        }
        this.props.rejectBatch(batchActionId, this.props.action.label, batch);
        this.props.handleDetailsClose();
    };
    onClose() {
        this.props.toggleRejectBatchPopup(this.props.action);
    };
    onChange(params) {
        this.props.update(params);
    }

    render() {
        let onSuccess = (action) => {
            this.onSuccess(action);
        };
        let title = <text> {this.props.batchActionName} </text>;
        return (
                <ActionStatusWithReasonDialog
                  page={'batch'}
                  action={this.props.action}
                  onClose={this.onClose}
                  onSuccess={onSuccess}
                  onChange={this.onChange}
                  title={title}
                //  title='Reason for rejecting Batch'
                  open={this.props.opened} // Todo
                />
        );
    }
};

RejectDetails.propTypes = {
    opened: PropTypes.bool.isRequired,
    toggleRejectBatchPopup: PropTypes.func,
    handleDetailsClose: PropTypes.func,
    update: PropTypes.func,
    namedBatch: PropTypes.bool,
    reasonId: PropTypes.number,
    comment: PropTypes.string,
    rejectBatch: PropTypes.func,
    actionList: PropTypes.array,
    batchActionName: PropTypes.string,
    action: PropTypes.object.isRequired,
    editableValues: PropTypes.object,
    saveableValues: PropTypes.object,
    checkedBatchItems: PropTypes.object
};
function mapStateToProps(state) {
    let namedBatch;
    // call is from details popup
    namedBatch = state.batchDetails.get('embossedTypeId') === state.utCardStatusAction.get('embossedTypeIdNamed') ? true
                : ((state.batchDetails.get('embossedTypeId') === state.utCardStatusAction.get('embossedTypeIdNoNamed')) ? false
                : null);
    return {
        opened: state.rejectDetails.get('opened'),
        action: state.rejectDetails.get('action'),
        actionList: state.utCardStatusAction.get('actions-batch') || [],
        batchActionName: state.rejectDetails.get('batchActionName'),
        namedBatch: namedBatch,
        reasonId: state.rejectDetails.get('reasonId'),
        comment: state.rejectDetails.get('comment'),
        editableValues: state.batchDetails.get('editableValues'),
        saveableValues: state.batchDetails.get('saveableValues'),
        checkedBatchItems: state.batchesGrid.get('checkedBatchItems')
    };
}
export default connect(
    mapStateToProps,
    {toggleRejectBatchPopup, handleDetailsClose, rejectBatch, update}
)(RejectDetails);
