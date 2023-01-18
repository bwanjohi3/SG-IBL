import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Text from 'ut-front-react/components/Text';
import {set as onSelect} from './actions';

export class ByStatus extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
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
              placeholder={<Text>Status</Text>}
              onSelect={this.handleSelect}
              canSelectPlaceholder
              data={this.props.data}
              defaultSelected={this.props.value}
            />
        );
    }
}

ByStatus.propTypes = {
    data: PropTypes.array.isRequired,
    value: PropTypes.any,
    onSelect: PropTypes.func.isRequired
};

export default connect(
    ({cardReasonFilterByStatus}) => {
        return {
            data: [
                {key: 1, name: 'Active'},
                {key: 0, name: 'Inactive'}
            ],
            value: cardReasonFilterByStatus.get('value')
        };
    },
    {onSelect}
)(ByStatus);
