import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Text from 'ut-front-react/components/Text';
import {update} from './actions';

export class ByIssuingUnit extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }
    handleSelect(record) {
        this.props.update(record.value);
    }
    render() {
        return (
            <Dropdown
              defaultSelected={this.props.value}
              placeholder={<Text>Issuing Business Unit</Text>}
              canSelectPlaceholder
              keyProp='issuingBusinessUnit'
              onSelect={this.handleSelect}
              data={this.props.data}
            />
        );
    }
}

ByIssuingUnit.propTypes = {
    value: PropTypes.node,
    data: PropTypes.array.isRequired,
    update: PropTypes.func.isRequired
};

export default connect(
    (state) => {
        return {
            data: state.batchesGrid.get('dropdownData').get('businessUnits').toJS(),
            value: state.batchesFilterByIssuingUnit.get('value')
        };
    },
    {update}
)(ByIssuingUnit);
