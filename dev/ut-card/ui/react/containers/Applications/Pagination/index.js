import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Pagination from './../../../components/Pagination';
import { updateApplicationsPagination } from './actions';

class ApplicationsPagination extends Component {
    render() {
        return (
            <div>
                <Pagination pagination={this.props.pagination} onUpdate={this.props.updateApplicationsPagination} />
            </div>
        );
    }
}

ApplicationsPagination.propTypes = {
    pagination: PropTypes.object,
    updateApplicationsPagination: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    return {
        pagination: state.cardApplicationsPagination.get('pagination')
    };
}

export default connect(
    mapStateToProps,
    { updateApplicationsPagination }
)(ApplicationsPagination);
