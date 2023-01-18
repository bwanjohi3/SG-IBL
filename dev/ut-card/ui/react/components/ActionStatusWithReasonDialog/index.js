import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { List } from 'immutable';

import Button from 'ut-front-react/components/Button';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import TextArea from 'ut-front-react/components/Input/TextArea';
import Text from 'ut-front-react/components/Text';

import ActionDialog from '../ActionDialog';

import buttonStyles from '../ActionStatusButton/style.css';
import dialogButtonStyles from '../ActionDialog/style.css';
import style from './style.css';

const reasonDropdownErrorMessage = 'Please select a reason';
const commentMaxLength = 1000;
const commentErrorMessage = `Comment should be less than ${commentMaxLength} symbols long`;

class ActionStatusWithReasonDialog extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.validateInput = this.validateInput.bind(this);

        // initial value is true so we dont get error when initializing screen
        this.isCommentValid = true;
        this.isReasonValid = true;

        this.state = {
            reasonId: -1,
            comment: '',
            isInputValid: false
        };
    };
    componentWillReceiveProps(nextProps) {
        if (this.props.open && !nextProps.open) {
            this.isCommentValid = true;
            this.isReasonValid = true;

            this.state = {
                reasonId: -1,
                comment: '',
                isInputValid: false
            };
        }
    }
    onChange(changedObj) {
        if (changedObj.key === 'comment') {
            this.isCommentValid = changedObj.value.length < commentMaxLength;
        } else if (changedObj.key === 'reasonId') {
            this.isReasonValid = changedObj.value > 0;
        }

        this.setState({[changedObj.key]: changedObj.value, isInputValid: (this.isReasonValid && this.isCommentValid)});
        this.props.onChange(changedObj);
    };
    validateInput() {
        this.isReasonValid = this.state.reasonId > 0;
        this.isCommentValid = this.state.comment.length < commentMaxLength;
        let isInputValid = this.isReasonValid && this.isCommentValid;

        this.setState({isInputValid: isInputValid});

        return isInputValid;
    }

    render() {
        let onSuccess = () => {
            if (this.validateInput()) {
                this.props.onSuccess(this.props.action);
            }
        };
        let onClose = () => {
            this.props.onClose();
            this.setState({reasonId: -1, comment: ''});
        };
        let actions = [
            <Button
              className={classnames(buttonStyles.statusActionButton, buttonStyles.highlighted, dialogButtonStyles.actionDialogButton)}
              onTouchTap={onSuccess}> <Text>{this.props.action.name}</Text> </Button>,
            <Button
              className={classnames(buttonStyles.statusActionButton, dialogButtonStyles.actionDialogButton)}
              onTouchTap={onClose}> <Text> Close </Text> </Button>
        ];
        let title = `${this.props.action.name} reason`;
        let content = (
            <div className={style.rejectContent}>
                <Dropdown
                  data={this.props.reasons}
                  keyProp='reasonId'
                  label='Reason*'
                  boldLabel
                  placeholder='Select'
                  onSelect={this.onChange}
                  errorMessage={reasonDropdownErrorMessage}
                  isValid={this.isReasonValid}
                  defaultSelected={this.state.reasonId > 0 ? this.state.reasonId : undefined}
                />
                <TextArea
                  label='Comment'
                  keyProp='comment'
                  placeholder='Comment'
                  onChange={this.onChange}
                  errorMessage={commentErrorMessage}
                  isValid={this.isCommentValid}
                  value={this.state.comment}
                />
            </div>
        );

        return (
            <ActionDialog
              externalMainContentWrapClass={style.contentWrap}
              actions={actions}
              title={title}
              open={this.props.open}
              onClose={onClose}>
                {content}
            </ActionDialog>
        );
    };
};

ActionStatusWithReasonDialog.propTypes = {
    reasons: PropTypes.array.isRequired,
    action: PropTypes.shape({
        label: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired,
    open: PropTypes.bool.isRequired,
    page: PropTypes.oneOf(['application', 'card', 'batch', 'cardInUse']).isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
};

ActionStatusWithReasonDialog.defaultProps = {
    open: false
};

export default connect(
    (state, ownProps) => {
        let reasons = List();
        if (ownProps.reasons) {
            reasons = List(ownProps.reasons);
        } else if (state.utCardStatusAction.get(`reasons-${ownProps.page}`)) {
            reasons = state.utCardStatusAction.get(`reasons-${ownProps.page}`).filter((reason) => {
                return reason.actionLabel === ownProps.action.label;
            });
        }

        return {
            reasons: reasons.toJS()
        };
    }, {})(ActionStatusWithReasonDialog);
