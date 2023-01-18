import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Text from 'ut-front-react/components/Text';
import ActionStatusButtonsGroup from '../../../components/ActionStatusButtonsGroup';
import {openCreateBatchDialog} from './../Popups/CreateBatch/actions';
import {openAddToExistingBatchDialog} from './../Popups/AddToExistingBatch/actions';
import {fetchCustomerDetails} from './../Popups/Details/actions';

import style from '../../../components/ActionStatusButton/style.css';

const actionsToExclude = ['ApproveNamed', 'ApproveNoNamed', 'Reject', 'Update', 'Decline', 'RemoveFromBatch'];

export class Buttons extends Component {
    constructor(props, context) {
        super(props, context);
        this.fetchCustomerDetails = this.fetchCustomerDetails.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    fetchCustomerDetails() {
        this.props.fetchCustomerDetails(this.props.checked.getIn(['0', 'applicationId']));
    }
    handleClick(actionData) {
        let {checked, openCreateBatchDialog, openAddToExistingBatchDialog} = this.props;
        if (actionData.label === 'CreateBatch') {
            openCreateBatchDialog(checked);
        } else if (actionData.label === 'AddToBatch') {
            openAddToExistingBatchDialog(checked);
        }
    }
    render() {
        let currentStatuses = this.props.checked.toJS().reduce((prev, cur) => {
            if (!~prev.indexOf(cur.statusId)) {
                prev.push(cur.statusId);
            }
            return prev;
        }, []);
        let disabled = (this.props.checked.size !== 1) ? 'disabled' : '';
        let nameCards = this.props.checked.filter((checked) => {
            return checked.get('embossedTypeName') === 'Named cards';
        });

        let shouldExcludeByTypeDiff = nameCards.size === this.props.checked.size; // show group when all applications are named applications
        return <div>
            {this.context.checkPermission('card.application.get') && <button style={{margin: '0 10px 0 0'}} className={disabled ? style.statusActionButtonDisabled : style.statusActionButton} disabled={disabled} onTouchTap={!disabled ? this.fetchCustomerDetails : () => {}}>
                <Text>Details</Text>
            </button>}
            {shouldExcludeByTypeDiff && <ActionStatusButtonsGroup page='application' actionTypeFor={'named'} excludeActions={actionsToExclude} statusIds={currentStatuses} handleClick={this.handleClick} />}
        </div>;
    }
}

Buttons.propTypes = {
    checked: PropTypes.object.isRequired,
    actionsBylabel: PropTypes.object.isRequired,
    openCreateBatchDialog: PropTypes.func.isRequired,
    openAddToExistingBatchDialog: PropTypes.func.isRequired,
    fetchCustomerDetails: PropTypes.func.isRequired
};

Buttons.contextTypes = {
    checkPermission: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    return {
        checked: state.cardApplicationsGrid.get('checkedRows').toList(),
        actionsBylabel: state.utCardStatusAction.get('actions-application-by-label') || {}
    };
}
export default connect(
    mapStateToProps,
    {openCreateBatchDialog, openAddToExistingBatchDialog, fetchCustomerDetails}
)(Buttons);
