import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {ActionStatus} from '../ActionStatus';
import ActionStatusButton from '../ActionStatusButton';
import style from './style.css';

export class ActionStatusButtonsGroup extends ActionStatus {
    getStyle(name) {
        return this.props.externalStyle[name] || this.context.implementationStyle[name] || style[name];
    }
    render() {
        let actionFor = {named: 1, noNamed: 2}[this.props.actionTypeFor]; // actionFor = 0 is for all types
        return (
            <div className={this.getStyle('statusActionButtonWrapper')}>
                {this.props.actions
                    .filter((item, idx) => {
                        return this.props.excludeActions.indexOf(item.label) < 0;
                    })
                    .filter((item, idx) => {
                        return (!actionFor || actionFor === item.for || !item.for);
                    }).map((item, idx, arr) => {
                        let isHighlighted = this.props.highlighted.indexOf(item.label) > -1;
                        let isDisabled = this.props.disabled.indexOf(item.label) > -1;
                        let r;
                        let lastItem = arr[idx + 1] === undefined;
                        if (this.props.nestComponents && this.props.nestComponents[item.label]) {
                            r = this.props.nestComponents[item.label](idx, this.props.statusIds, item, lastItem, isDisabled);
                        } else {
                            r = (
                                <ActionStatusButton
                                  key={idx}
                                  page={this.props.page}
                                  currentStatuses={this.props.statusIds}
                                  action={item}
                                  isHighlighted={isHighlighted}
                                  handleClick={this.props.handleClick}
                                  isDisabled={isDisabled}
                                  padRight
                                >
                                    {item.name}
                                </ActionStatusButton>
                            );
                        }
                        return r;
                    }
                )}
            </div>
        );
    }
}

ActionStatusButtonsGroup.propTypes = {
    externalStyle: PropTypes.object,
    nestComponents: PropTypes.object,
    handleClick: PropTypes.func,
    page: PropTypes.string.isRequired,
    actionTypeFor: React.PropTypes.oneOf(['named', 'noNamed', 'all']),
    statusIds: PropTypes.array.isRequired,
    actions: PropTypes.array.isRequired,
    highlighted: PropTypes.array,
    disabled: PropTypes.array,
    excludeActions: PropTypes.array.isRequired,
    padRight: PropTypes.bool
};

ActionStatusButtonsGroup.defaultProps = {
    externalStyle: {},
    excludeActions: [],
    actionTypeFor: 'all',
    highlighted: [],
    disabled: [],
    handleClick: (item) => {}
};

ActionStatusButtonsGroup.contextTypes = {
    implementationStyle: PropTypes.object
};

export default connect(
    (state, ownProps) => {
        return {
            stateTable: (state.utCardStatusAction.get(`state-${ownProps.page}`) || List()).toJS(),
            actions: state.utCardStatusAction.get(`actions-${ownProps.page}`) || []
        };
    },
    {}
)(ActionStatusButtonsGroup);
