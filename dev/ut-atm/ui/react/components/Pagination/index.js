import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import AdvancedPagination from 'ut-front-react/components/AdvancedPagination';

import {updatePagination} from './actions';

import style from './style.css';

class Pagination extends Component {
    render() {
        return (
            <div className={style.paginationWrap}>
                <AdvancedPagination
                  pagination={this.props.pagination}
                  onUpdate={this.props.updatePagination} />
            </div>
        );
    }
}

Pagination.propTypes = {
    pagination: PropTypes.object.isRequired,
    updatePagination: PropTypes.func.isRequired
};

export default connect((state, ownProps) => ({
    pagination: state.atmTerminalGridPagination.get('pagination')
}), {updatePagination})(Pagination);
