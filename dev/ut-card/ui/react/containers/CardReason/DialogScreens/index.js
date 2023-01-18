import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import {updatePage} from './actions';

import CardReasonCreateDialog from './Create';
import CardReasonEditDialog from './Edit';
import CardReasonDeleteDialog from './Delete';
import CardReasonStatusUpdateDialog from './StatusUpdate';

class CardReasonDialogScreens extends Component {
    componentWillReceiveProps(nextProps) {
        if (nextProps.changeId !== this.props.changeId) {
            this.props.updatePage();
        }
    };
    render() {
        return (
            <div>
                { this.props.createOpen && <CardReasonCreateDialog /> }
                { this.props.editOpen && <CardReasonEditDialog /> }
                { this.props.deleteOpen && <CardReasonDeleteDialog /> }
                { this.props.statusUpdateOpen && <CardReasonStatusUpdateDialog /> }
            </div>
        );
    }
};
CardReasonDialogScreens.propTypes = {
    // data
    createOpen: PropTypes.bool.isRequired,
    editOpen: PropTypes.bool.isRequired,
    deleteOpen: PropTypes.bool.isRequired,
    statusUpdateOpen: PropTypes.bool.isRequired,

    changeId: PropTypes.number.isRequired,

    // actions
    updatePage: PropTypes.func.isRequired
};
export default connect(({
    cardReasonCreateDialog,
    cardReasonEditDialog,
    cardReasonDeleteDialog,
    cardReasonStatusUpdateDialog
}) => ({
    createOpen: cardReasonCreateDialog.get('open'),
    editOpen: cardReasonEditDialog.get('open'),
    deleteOpen: cardReasonDeleteDialog.get('open'),
    statusUpdateOpen: cardReasonStatusUpdateDialog.get('open'),
    changeId: (
        cardReasonCreateDialog.get('changeId') +
        cardReasonEditDialog.get('changeId') +
        cardReasonDeleteDialog.get('changeId') +
        cardReasonStatusUpdateDialog.get('changeId')
    )
}),
{updatePage})(CardReasonDialogScreens);
