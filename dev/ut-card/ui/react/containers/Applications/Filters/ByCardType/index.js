import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Text from 'ut-front-react/components/Text';
import {updateCardType} from './actions';

export class ByStatus extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }
    handleSelect(record) {
        this.props.updateCardType(record.value);
    }
    render() {
        return (
            <Dropdown
              defaultSelected={this.props.value}
              placeholder={<Text>Type</Text>}
              canSelectPlaceholder
              keyProp='name'
              onSelect={this.handleSelect}
              data={this.props.data}
              menuAutoWidth />
        );
    }
}

ByStatus.propTypes = {
    value: PropTypes.node,
    data: PropTypes.array.isRequired,
    updateCardType: PropTypes.func.isRequired
};

export default connect(
    (state) => {
        return {
            data: state.utCardStatusAction.get('embossedTypes').toJS(),
            value: state.cardApplicationsFilterByCardType.get('value')
        };
    },
    {updateCardType}
)(ByStatus);
