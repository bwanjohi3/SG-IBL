import React, {Component, PropTypes} from 'react';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Text from 'ut-front-react/components/Text';

export default class ByIssuingBusinessUnit extends Component {
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
        let dropdownData = this.props.data.toJS();

        return (
            <Dropdown
              placeholder={<Text>Issuing Business Unit</Text>}
              canSelectPlaceholder
              onSelect={this.handleSelect}
              data={dropdownData}
              defaultSelected={this.props.value}
              menuAutoWidth={this.props.menuAutoWidth} />
        );
    }
}

ByIssuingBusinessUnit.propTypes = {
    data: PropTypes.object.isRequired, // immutable list
    value: PropTypes.any,
    onSelect: PropTypes.func.isRequired,
    fetch: PropTypes.func.isRequired,
    menuAutoWidth: PropTypes.bool
};
