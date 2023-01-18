import React, {Component, PropTypes} from 'react';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Text from 'ut-front-react/components/Text';

export class ByProduct extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillMount() {
        if (this.props.ownershipId) {


            this.props.fetch(this.props.ownershipId);
            this.areProductsFetched = true;
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.ownershipId && !this.areProductsFetched) {
            this.props.fetch(nextProps.ownershipId);
            this.areProductsFetched = true;
        }
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
              placeholder={<Text>Card Product</Text>}
              canSelectPlaceholder
              onSelect={this.handleSelect}
              data={dropdownData}
              defaultSelected={this.props.value}
              menuAutoWidth={this.props.menuAutoWidth} />
        );
    }
}

ByProduct.propTypes = {
    ownershipId: PropTypes.array,
    data: PropTypes.object.isRequired, // immutable list
    value: PropTypes.any,
    onSelect: PropTypes.func.isRequired,
    fetch: PropTypes.func.isRequired,
    menuAutoWidth: PropTypes.bool
};
