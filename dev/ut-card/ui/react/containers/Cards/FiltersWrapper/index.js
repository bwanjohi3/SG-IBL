import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {fetchUnits} from './actions';

export class FiltersWrapper extends Component {
    componentWillMount() {
        this.props.fetchUnits();
    }
    render() {
        return (
            <div className={this.props.wrapperClassName}>
                {this.props.children}
            </div>
        );
    }
}

FiltersWrapper.propTypes = {
    wrapperClassName: PropTypes.string,
    children: PropTypes.any,
    fetchUnits: PropTypes.func.isRequired
};

export default connect(
    (state) => ({}),
    {fetchUnits}
)(FiltersWrapper);
