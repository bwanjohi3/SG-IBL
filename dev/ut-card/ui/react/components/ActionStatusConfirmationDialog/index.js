import React, {Component, PropTypes} from 'react';
import classnames from 'classnames';

import Button from 'ut-front-react/components/Button';
import Text from 'ut-front-react/components/Text';

import ActionDialog from '../ActionDialog';

import buttonStyles from '../ActionStatusButton/style.css';
import actionDialogStyles from '../ActionDialog/style.css';
import style from './style.css';

class ActionStatusConfirmationDialog extends Component {
    constructor(props) {
        super(props);
        this.onSuccess = this.onSuccess.bind(this);
    }
    onSuccess() {
        this.props.onSuccess(this.props.action);
    }
    render() {
        let translationLabel = `ActionStatusConfirmationDialog-${this.props.page}-${this.props.action.label}`;
        let confirmationMessage = (
            this.props.confirmationMessage ? this.props.confirmationMessage : (<Text>{translationLabel}</Text>)
        );
        let title = this.props.action.name;
        let actions = [
            <Button
              className={classnames(buttonStyles.statusActionButton, buttonStyles.highlighted, actionDialogStyles.actionDialogButton)}
              onTouchTap={this.onSuccess}> {this.props.action.name} </Button>,
            <Button
              className={classnames(buttonStyles.statusActionButton, actionDialogStyles.actionDialogButton)}
              onTouchTap={this.props.onCancel}> <Text> Cancel </Text> </Button>
        ];
        return (
            <ActionDialog
              open={this.props.open}
              externalMainContentWrapClass={this.props.externalMainContentWrapClass || style.contentWrap}
              title={title}
              onClose={this.props.onCancel}
              actions={actions}
            >
                {confirmationMessage}
            </ActionDialog>
        );
    }
}
ActionStatusConfirmationDialog.propTypes = {
    externalMainContentWrapClass: PropTypes.string,
    confirmationMessage: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    page: PropTypes.string,
    action: PropTypes.shape({
        label: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired,
    open: PropTypes.bool.isRequired,
    onSuccess: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default ActionStatusConfirmationDialog;
