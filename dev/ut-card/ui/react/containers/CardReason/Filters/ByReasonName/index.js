import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import SearchBox from 'ut-front-react/components/SearchBox';
import {set as setValue} from './actions';

export class ByCustomSearch extends Component {
    constructor(props) {
        super(props);
        this.handleSearch = this.handleSearch.bind(this);
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
                <SearchBox
                  placeholder={'Search for reason'}
                  defaultValue={this.props.value}
                  onSearch={this.handleSearch} />
            </div>
        );
    }
}

ByCustomSearch.propTypes = {
    setValue: PropTypes.func.isRequired,
    value: PropTypes.string
};

export default connect(
    ({cardManagementFilterByCustomSearch}) => {
        return {
            value: cardManagementFilterByCustomSearch.get('value')
        };
    },
    {setValue}
)(ByCustomSearch);
