import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import ConfirmDialog from 'ut-front-react/components/ConfirmDialog';
import {closeDialog} from './actions';

export class BatchDownloadInfo extends Component {
    componentWillReceiveProps(nextProps) {
        if (nextProps.open) {
            this.refs['confirmDialog'].open(nextProps.confirmationMessage);
        } else if (!nextProps.open) {
            this.refs['confirmDialog'].close();
            if (nextProps.download) {
                let tempLink = document.createElement('a');
                tempLink.href = `/rpc/batch/download/${nextProps.batchId}`;
                // // tempLink.setAttribute('download', selectedAttachment.getIn(['attachments', 0, 'filename']));
                // tempLink.setAttribute('target', '_blank');
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
            }
        }
    }
    render() {
        return (
            <div>
                <ConfirmDialog
                  cannotSubmit
                  title={'Data generation progress'}
                  message={this.props.confirmationMessage}
                  cancelLabel={'Close'}
                  ref={'confirmDialog'}
                  onClose={this.props.closeDialog}
                />
            </div>
        );
    }
}

BatchDownloadInfo.propTypes = {
    open: PropTypes.bool,
    download: PropTypes.bool,
    confirmationMessage: PropTypes.string,
    batchId: PropTypes.number,

    closeDialog: PropTypes.func
};

export default connect(
    (state) => {
        return {
        };
    },
    {closeDialog}
)(BatchDownloadInfo);
