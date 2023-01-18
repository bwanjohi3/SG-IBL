import React, {Component, PropTypes} from 'react';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Text from 'ut-front-react/components/Text';

export class ByStatus extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }
    handleSelect(record) {
        this.props.updateCardStatus(record.value);
    }
    render() {
        return (
            <Dropdown
              defaultSelected={this.props.value}
              placeholder={<Text>Status</Text>}
              canSelectPlaceholder
              keyProp='statusId'
              onSelect={this.handleSelect}
              data={this.props.data}
              menuAutoWidth={this.props.menuAutoWidth} />
        );
    }
}

ByStatus.propTypes = {
    value: PropTypes.node,
    data: PropTypes.array.isRequired,
    updateCardStatus: PropTypes.func.isRequired,
    menuAutoWidth: PropTypes.bool
};
