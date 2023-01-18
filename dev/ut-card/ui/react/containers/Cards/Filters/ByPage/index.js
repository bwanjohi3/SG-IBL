import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Pagination from '../../../../components/Pagination';
import { update } from './actions';

class ByPage extends Component {
    render() {
        return (
            <div>
                <Pagination pagination={this.props.pagination} onUpdate={this.props.update} />
            </div>
        );
    }
}

ByPage.propTypes = {
    pagination: PropTypes.object,
    update: PropTypes.func
};

function mapStateToProps({cardManagementFilterByPage}, ownProps) {
    return {
        pagination: cardManagementFilterByPage.get('pagination')
    };
}

export default connect(
    mapStateToProps,
    { update }
)(ByPage);
