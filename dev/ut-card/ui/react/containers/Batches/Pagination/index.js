import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Pagination from '../../../components/Pagination';
import {update} from './actions';

class BatchesPagination extends Component {
    render() {
        return (
            <div>
                <Pagination pagination={this.props.pagination} onUpdate={this.props.update} />
            </div>
        );
    }
}

BatchesPagination.propTypes = {
    pagination: PropTypes.object,
    update: PropTypes.func
};

export default connect(
    (state, ownProps) => {
        return {
            pagination: state.batchesPagination.get('pagination')
        };
    },
    {update}
)(BatchesPagination);
