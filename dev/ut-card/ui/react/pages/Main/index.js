import {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {fetch, fetchStatuses, fetchEmbossedTypes, fetchOwnershipTypes} from './actions';

class Main extends Component {
    componentDidMount() {
        if (!this.props.methodRequestState) {
            this.props.fetch();
            this.props.fetchStatuses();
            this.props.fetchEmbossedTypes();
            this.props.fetchOwnershipTypes();
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.changeId !== this.props.changeId) {
            this.props.fetch();
        }
    }

    render() {
        return this.props.children;
    }
};

Main.propTypes = {
    fetch: PropTypes.func.isRequired,
    fetchStatuses: PropTypes.func.isRequired,
    fetchEmbossedTypes: PropTypes.func.isRequired,
    fetchOwnershipTypes: PropTypes.func.isRequired,
    methodRequestState: PropTypes.string,
    children: PropTypes.node,
    changeId: PropTypes.number.isRequired
};

export default connect(
    (state, ownProps) => {
        return {
            methodRequestState: state.utCardStatusAction.get('methodRequestState'),

            // refetch if any change in reasons
            changeId: state.cardReasonDialogScreens.get('changeId')
        };
    },
    {fetch, fetchStatuses, fetchEmbossedTypes, fetchOwnershipTypes}
)(Main);
