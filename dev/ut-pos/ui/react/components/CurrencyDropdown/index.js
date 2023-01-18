import {connect} from 'react-redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import {fetch} from './actions';
import React, { Component, PropTypes } from 'react';

class CurrencyDropddown extends Component {
    componentWillMount() {
        if (this.props.methodRequestState === '') {
            this.props.fetch();
        }
    }
    render() {
        return (
            <Dropdown {...this.props} />
        );
    }
}

CurrencyDropddown.propTypes = {
    fetch: PropTypes.func,
    methodRequestState: PropTypes.string
};

export default connect(
    (state) => {
        return {
            data: state.currencyDropdown.get('data').toJS(),
            methodRequestState: state.currencyDropdown.get('methodRequestState')
        };
    },
    {fetch}
)(CurrencyDropddown);
