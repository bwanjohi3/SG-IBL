import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import Text from 'ut-front-react/components/Text';

import {closeSuccess} from './../NoNameBatch/actions';
import {getDialogTitle, titleStyle} from '../../../components/ActionDialog/helpers';

import cancelStyle from '../../../components/ActionStatusButton/style.css';
import dialogStyles from '../../../components/ActionDialog/style.css';
import style from './style.css';

export class SuccessDialog extends Component {
    render() {
        const actions = [
            <button onTouchTap={this.props.closeSuccess} className={cancelStyle.statusActionButton}><Text>Close</Text></button>
        ];
        return (
                <Dialog
                  title={getDialogTitle('Batch Name', this.props.closeSuccess)}
                  titleStyle={titleStyle}
                  open={this.props.opened}
                  autoScrollBodyContent
                  actionsContainerClassName={dialogStyles.actionButtons}
                  actions={actions}
                >
                  <div className={style.contentWrapper}>
                    <Text>Successfully created Batch</Text> - {this.props.successMessage}
                  </div>
                </Dialog>

        );
    }
};

SuccessDialog.propTypes = {
    opened: PropTypes.bool.isRequired,
    successMessage: PropTypes.string.isRequired,
    closeSuccess: PropTypes.func.isRequired
};

export default connect(
    (state) => {
        return {
            opened: state.noNameBatch.get('showSuccess'),
            successMessage: state.noNameBatch.get('successMessage')
        };
    },
    {closeSuccess}
)(SuccessDialog);
