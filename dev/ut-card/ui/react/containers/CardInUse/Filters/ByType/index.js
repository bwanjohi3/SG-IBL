import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import {set as onSelect, fetch} from './actions';

export class ByType extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillMount() {
        this.props.fetch();
    }
    handleSelect(record) {
        this.props.onSelect(record.value);
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.value) {
            return true;
        }
        return false;
    }
    render() {
        return (
            <Dropdown
              placeholder='Type'
              keyProp='name'
              onSelect={this.handleSelect}
              canSelectPlaceholder
              data={this.props.data}
              defaultSelected={this.props.value}
              menuAutoWidth />
        );
    }
}

ByType.propTypes = {
    data: PropTypes.array.isRequired,
    value: PropTypes.any,
    onSelect: PropTypes.func.isRequired,
    fetch: PropTypes.func.isRequired
};

export default connect(
    (state) => {
        return {
            data: state.cardInUseFilterByType.get('data').toJS() || [],
            value: state.cardInUseFilterByType.get('value')
        };
    },
    {onSelect, fetch}
)(ByType);
