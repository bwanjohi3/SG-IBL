import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Text from 'ut-front-react/components/Text';
import ActionStatusConfirmationDialog from './../../../components/ActionStatusConfirmationDialog';
import {fetchBinDetails, statusUpdateBins} from './../Popups/Details/actions';
import {prepareBinToUpdate} from './../Popups/Details/helpers';

import style from '../../../components/ActionStatusButton/style.css';
const getActionOnConfirm = (actionName) => {
    return {
        label: actionName.toLowerCase(),
        name: actionName
    };
};
const getConfirmationMessage = (statusText) => {
    return `Are you sure you want to ${statusText.toLowerCase()} BINs?`;
};

export class Buttons extends Component {
    constructor(props, context) {
        super(props, context);
        this.fetchBinDetails = this.fetchBinDetails.bind(this);
        this.statusUpdateBins = this.statusUpdateBins.bind(this);
        this.closeConfirmation = this.closeConfirmation.bind(this);
        this.state = {
            isConfirmationOpen: false
        };
    }
    fetchBinDetails() {
        this.props.fetchBinDetails(this.props.checked.getIn(['0', 'binId']));
    }
    statusUpdateBins() {
        if (!this.state.isConfirmationOpen) {
            this.setState({isConfirmationOpen: true});
        } else {
            let newStatus = !this.props.checked.getIn([0, 'isActive']);
            let params = this.props.checked.map((bin) => {
                let preparedBin = prepareBinToUpdate(bin);
                return {
                    binId: preparedBin.binId,
                    isActive: newStatus
                };
            }).toJS();
            let dataToSend = {
                bin: params
            };
            this.props.statusUpdateBins(dataToSend);
            this.closeConfirmation();
        }
    }
    closeConfirmation() {
        this.setState({
            isConfirmationOpen: false
        });
    }
    hasCheckedWithDifferentStatus() {
        let firstBinStatus = this.props.checked.getIn([0, 'isActive']);
        let hasAnotherBinStatus = this.props.checked.find((bin) => {
            return bin.get('isActive') !== firstBinStatus;
        });
        return !!hasAnotherBinStatus;
    }
    renderConfirmation() {
        let statusText = this.getStatusText();
        let confirmationDialog = <ActionStatusConfirmationDialog
          open={this.state.isConfirmationOpen}
          page='bin'
          action={getActionOnConfirm(statusText)}
          confirmationMessage={getConfirmationMessage(statusText)}
          onSuccess={this.statusUpdateBins}
          onCancel={this.closeConfirmation}
        />;

        return confirmationDialog;
    }
    getStatusText() {
        return this.props.checked.getIn([0, 'isActive']) ? 'Deactivate' : 'Activate';
    }
    render() {
        let hasPermissionToGet = this.context.checkPermission('card.bin.get');
        let disabledDetails = this.props.checked.size !== 1;
        let showChangeStatusBtn = this.context.checkPermission('card.bin.edit') && this.props.checked.size > 0;
        let changeStatusBtnDisabled = this.hasCheckedWithDifferentStatus();
        let changeStatusText = this.getStatusText();

        return <div>
            {hasPermissionToGet && <button style={{margin: '0 10px 0 0'}} className={disabledDetails ? style.statusActionButtonDisabled : style.statusActionButton} disabled={disabledDetails} onTouchTap={!disabledDetails ? this.fetchBinDetails : () => {}}>
                <Text>Details</Text>
            </button>}
            {showChangeStatusBtn && <button style={{margin: '0 10px 0 0'}} className={changeStatusBtnDisabled ? style.statusActionButtonDisabled : style.statusActionButton} disabled={changeStatusBtnDisabled} onTouchTap={!changeStatusBtnDisabled ? this.statusUpdateBins : () => {}}>
                <Text>{changeStatusText}</Text>
            </button>}
            {this.renderConfirmation()}
        </div>;
    }
}

Buttons.propTypes = {
    checked: PropTypes.object.isRequired,
    fetchBinDetails: PropTypes.func.isRequired,
    statusUpdateBins: PropTypes.func.isRequired
};

Buttons.contextTypes = {
    checkPermission: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    return {
        checked: state.cardBinsGrid.get('checkedRows').toList()
    };
}
export default connect(
    mapStateToProps,
    {fetchBinDetails, statusUpdateBins}
)(Buttons);
