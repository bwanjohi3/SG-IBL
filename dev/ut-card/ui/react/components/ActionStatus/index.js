import {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';

export class ActionStatus extends Component {
    findToStatuses() {
        let currentAction = this.props.action;
        if (!this.props.currentStatuses.length || !this.props.stateTable.length || !currentAction) {
            return [];
        }

        let foundStates = this.props.stateTable
            .filter((el, idx) => { // find all objects for current status with desired action
                let checkStatus = ~this.props.currentStatuses.indexOf(el.fromStatusId);
                let checkAction = currentAction.label === el.actionLabel;
                let evaluation = (checkStatus !== 0 && checkAction);
                return evaluation;
            });
        if (foundStates.length !== this.props.currentStatuses.length) {
            return [];
        }
        return foundStates.reduce((prev, cur, idx, array) => { // collect only to status, prev is unique.
            if (!~prev.indexOf(cur.toStatusId)) {
                prev.push(cur.toStatusId);
            }
            return prev;
        }, []);// if this returns more than 1 result this means that ??????
    }
    render() {
        let toStatuses = this.findToStatuses();

        if (toStatuses.length !== 1) {
            return false;
        }
        return this.props.children;
    }
}

ActionStatus.propTypes = {
    children: PropTypes.node,
    stateTable: PropTypes.array,
    page: PropTypes.oneOf(['application', 'card', 'batch', 'cardInUse']).isRequired,
    currentStatuses: PropTypes.array.isRequired,
    action: PropTypes.shape({
        id: PropTypes.number.isRequired,
        for: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired
};

ActionStatus.defaultProps = {};

ActionStatus.contextTypes = {};

export default connect(
    (state, ownProps) => {
        return {
            stateTable: (state.utCardStatusAction.get(`state-${ownProps.page}`) || List()).toJS()
        };
    }
)(ActionStatus);
