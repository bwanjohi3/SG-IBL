import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import SearchBox from 'ut-front-react/components/SearchBox';
import Text from 'ut-front-react/components/Text';
import {setField, setValue} from './actions';
import style from './style.css';

const fields = [
    {key: 'customerName', name: <Text>Customer Name</Text>},
    {key: 'customerNumber', name: <Text>Customer Number</Text>},
    {key: 'personName', name: <Text>Person Name</Text>},
    {key: 'batchName', name: <Text>Batch Name</Text>},
    {key: 'applicationId', name: <Text>App Number</Text>},
    {key: 'cardNumber', name: <Text>Card Number</Text>}
];

export class ByCustomSearch extends Component {
    constructor(props) {
        super(props);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillMount() {
        if (!this.props.field) {
            this.props.setField(this.props.defaultField);
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.defaultField !== this.props.defaultField) {
            this.props.setField(nextProps.defaultField);
        }
    }
    handleSelect(record) {
        this.props.setField(record.value);
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.value) {
            return true;
        }
        return false;
    }
    handleSearch(value) {
        this.props.setValue(value);
    }
    render() {
        return (
            <div>
                <div className={style.customSearchDropdown}>
                    <Dropdown
                      defaultSelected={this.props.field}
                      placeholder={<Text>Search By</Text>}
                      keyProp='name'
                      onSelect={this.handleSelect}
                      data={fields.filter((field) => (this.props.allowedFields.indexOf(field.key) >= 0))}
                      menuAutoWidth />
                </div>
                <div className={style.customSearchTextField}>
                    <SearchBox defaultValue={this.props.value} onSearch={this.handleSearch} />
                </div>
            </div>
        );
    }
}

ByCustomSearch.propTypes = {
    setField: PropTypes.func.isRequired,
    setValue: PropTypes.func.isRequired,
    field: PropTypes.string,
    value: PropTypes.string,
    allowedFields: PropTypes.object,
    defaultField: PropTypes.string.isRequired
};

export default connect(
    (state, ownProps) => {
        return {
            field: state.cardApplicationsFilterByCustomSearch.get('field'),
            value: state.cardApplicationsFilterByCustomSearch.get('value'),
            allowedFields: ownProps.allowedFields,
            defaultField: ownProps.defaultField
        };
    },
    {setField, setValue}
)(ByCustomSearch);
