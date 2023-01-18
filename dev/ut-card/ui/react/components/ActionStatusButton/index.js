import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {ActionStatus} from '../ActionStatus';
import style from './style.css';

export class ActionStatusButton extends ActionStatus {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    getStyle(name) {
        return this.props.externalStyle[name] || this.context.implementationStyle[name] || style[name];
    }
    handleClick(action) {
        let isDisabled = this.props.isDisabled;
        return () => {
            if (action && !isDisabled) {
                this.props.handleClick(action);
            }
        };
    }
    render() {
        let toStatuses = this.findToStatuses();
        let styles = [this.getStyle('statusActionButton'), this.getStyle(`statusActionButton-${this.props.action.label}`)];
        if (this.props.isDisabled) {
            styles.push(this.getStyle('statusActionButtonDisabled'));
        } else if (this.props.isHighlighted) {
            styles.push(this.getStyle('highlighted'));
        }
        if (toStatuses.length !== 1) {
            return false;
        }

        return (
            <div className={this.getStyle('actionStatusButtonWrap')}>
                <button
                  className={styles.join(' ')}
                  onTouchTap={this.handleClick(this.props.action)}
                >
                    {this.props.children}
                </button>
                {this.props.padRight && <div className={this.getStyle('actionStatusButtonPadRight')} />}
            </div>
        );
    }
}

ActionStatusButton.propTypes = {
    externalStyle: PropTypes.object,
    padRight: PropTypes.bool,
    isHighlighted: PropTypes.bool,
    page: PropTypes.string,
    isDisabled: PropTypes.bool,
    handleClick: PropTypes.func
};

ActionStatusButton.defaultProps = {
    externalStyle: {},
    isHighlighted: false,
    isDisabled: false,
    handleClick: (record) => {}
};

ActionStatusButton.contextTypes = {
    implementationStyle: PropTypes.object
};

export default connect(
    (state, ownProps) => {
        return {
            stateTable: (state.utCardStatusAction.get(`state-${ownProps.page}`) || List()).toJS()
        };
    },
    {}
)(ActionStatusButton);
