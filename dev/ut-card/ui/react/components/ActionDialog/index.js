import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import {getDialogTitle} from './helpers';
import dialogStyles from './style.css';

class ActionDialog extends Component {
    render() {
        if (!this.props.open) {
            return null;
        }
        return (
            <Dialog
              actions={this.props.actions}
              autoScrollBodyContent={this.props.autoScrollBodyContent}
              actionsContainerClassName={dialogStyles.actionButtons}
              repositionOnUpdate={false}
              modal
              bodyClassName={dialogStyles.bodyWrap}
              title={getDialogTitle(this.props.title, this.props.onClose)}
              titleClassName={dialogStyles.titleWrap}
              open={this.props.open}>
                {this.props.header &&
                <div className={dialogStyles.headerWrap}>
                    {this.props.header}
                </div>}
                <div className={this.props.externalMainContentWrapClass}>
                    <div className={dialogStyles.mainContent}>
                        {this.props.children}
                    </div>
                </div>
            </Dialog>
        );
    };
};

ActionDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    header: PropTypes.node,
    children: PropTypes.node.isRequired,
    actions: PropTypes.array.isRequired,
    autoScrollBodyContent: PropTypes.bool,
    externalMainContentWrapClass: PropTypes.string,
    onClose: PropTypes.func
};

ActionDialog.defaultProps = {
    open: false,
    autoScrollBodyContent: false
};

export default ActionDialog;
