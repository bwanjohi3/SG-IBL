import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {ActionStatus} from '../ActionStatus';
import style from './style.css';

export class ActionStatusLink extends ActionStatus {
    getStyle(name) {
        return this.props.externalStyle[name] || this.context.implementationStyle[name] || style[name];
    }
    render() {
        let toStatuses = this.findToStatuses();
        let styles = [this.getStyle('statusActionButton'), this.getStyle(`statusActionButton-${this.props.action.label}`)];
        if (this.props.isHighlighted) {
            styles.push(this.getStyle(`highlighted`));
        }
        if (toStatuses.length !== 1) {
            return false;
        }

        return (
            <a className={(this.getStyle('actionStatusButtonWrap'))} href={(this.props.isDisabled ? undefined : this.props.href)}>
                <span className={this.props.isDisabled ? this.getStyle('statusActionButtonDisabled') : styles.join(' ')} onClick={this.props.handleClick}>
                    {this.props.children}
                </span>
                {this.props.padRight && <span className={this.getStyle('actionStatusButtonPadRight')} />}
            </a>
        );
    }
}

ActionStatusLink.propTypes = {
    externalStyle: PropTypes.object,
    padRight: PropTypes.bool,
    page: PropTypes.string,
    handleClick: PropTypes.func,
    isDisabled: PropTypes.bool,
    isHighlighted: PropTypes.bool,
    href: PropTypes.string
};

ActionStatusLink.defaultProps = {
    externalStyle: {},
    isHighlighted: false,
    href: undefined
};

ActionStatusLink.contextTypes = {
    implementationStyle: PropTypes.object
};

export default connect(
    (state, ownProps) => {
        return {
            stateTable: (state.utCardStatusAction.get(`state-${ownProps.page}`) || List()).toJS()
        };
    },
    {}
)(ActionStatusLink);
