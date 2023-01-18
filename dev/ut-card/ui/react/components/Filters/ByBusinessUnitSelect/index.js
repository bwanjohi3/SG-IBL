import React, {Component, PropTypes} from 'react';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Text from 'ut-front-react/components/Text';

export class ByBusinessUnit extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillMount() {
        this.props.fetch();
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.value) {
            return true;
        }
        return false;
    }
    handleSelect(record) {
        this.props.onSelect(record.value);
    }
    render() {
        let businessUnitDropDownData = this.props.data.toJS();

        return (
            <Dropdown
              canSelectPlaceholder
              placeholder={<Text>{this.props.placeholder}</Text>}
              onSelect={this.handleSelect}
              data={businessUnitDropDownData}
              defaultSelected={this.props.value}
              menuAutoWidth={this.props.menuAutoWidth}
            />
        );
    }
}

ByBusinessUnit.propTypes = {
    // data
    placeholder: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired, // immutable list
    value: PropTypes.any,
    onSelect: PropTypes.func.isRequired,
    menuAutoWidth: PropTypes.bool,
    // actions
    fetch: PropTypes.func.isRequired
};

ByBusinessUnit.defaultProps = {
    fetch: () => {}
};
