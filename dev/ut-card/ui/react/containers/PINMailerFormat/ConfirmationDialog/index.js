import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import Dialog from 'material-ui/Dialog';
import Button from 'ut-front-react/components/Button';
import Text from 'ut-front-react/components/Text';

import buttonStyles from '../../../components/ActionStatusButton/style.css';
import dialogStyles from './style.css';
import actionDialogStyles from '../../../components/ActionDialog/style.css';

class ConfirmationDialog extends Component {
    render() {
        if (!this.props.open) {
            return null;
        }
        let actions = [
            <Button
              className={classnames(buttonStyles.statusActionButton, buttonStyles.highlighted, actionDialogStyles.actionDialogButton)}
              onTouchTap={this.props.onSuccess}> {this.props.actionName} </Button>,
            <Button
              className={classnames(buttonStyles.statusActionButton, actionDialogStyles.actionDialogButton)}
              onTouchTap={this.props.onCancel}> <Text> Cancel </Text> </Button>
        ];
        return (
            <Dialog
              actions={actions}
              actionsContainerClassName={dialogStyles.actionButtons}
              repositionOnUpdate={false}
              modal
              bodyClassName={dialogStyles.bodyWrap}
              title={this.props.title}
              titleClassName={dialogStyles.titleWrap}
              open={this.props.open}>
                <div className={dialogStyles.mainContent}>
                    {this.props.confirmationMessage}
                </div>
            </Dialog>
        );
    };
};

ConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    confirmationMessage: PropTypes.string.isRequired,
    actionName: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

ConfirmationDialog.defaultProps = {
    open: false
};

export default ConfirmationDialog;
