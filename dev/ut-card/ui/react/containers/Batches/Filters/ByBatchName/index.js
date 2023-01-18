import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import SearchBox from 'ut-front-react/components/SearchBox';
import {set as onChange} from './actions';

export class ByBatchName extends Component {
    constructor(props) {
        super(props);
        this.onSearch = this.onSearch.bind(this);
    }
    onSearch(value) {
        this.props.onChange(value);
    }
    translate(stringToTranslate) {
        return this.context.translate(stringToTranslate);
    };
    render() {
        return (
            <SearchBox
              clearOnSearch={false}
              placeholder={this.translate('By Batch Name')}
              onSearch={this.onSearch}
              defaultValue={this.props.value}
            />
        );
    }
}

ByBatchName.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string
};
ByBatchName.contextTypes = {
    translate: PropTypes.func
};

export default connect(
    (state) => {
        return {
            value: state.batchesFilterByBatchName.get('value')
        };
    },
    {onChange}
)(ByBatchName);
