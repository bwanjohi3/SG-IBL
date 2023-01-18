import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Text from 'ut-front-react/components/Text';
import {fetch, set as onSelect} from './actions';

import {parseModuleActions} from '../.././helpers';

export class ByModule extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillMount() {
        if (!this.props.actions || !this.props.actions.size) {
            this.props.fetch();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.actions || !nextProps.actions.size) {
            this.props.fetch();
        }
    }

    handleSelect(record) {
        this.props.onSelect(record.value);
    }

    render() {
        let data = parseModuleActions(this.props.module, this.props.actions);

        return (
            <div>
                <Dropdown
                  placeholder={<Text>Action</Text>}
                  onSelect={this.handleSelect}
                  canSelectPlaceholder
                  data={data}
                  defaultSelected={this.props.value}
                />
            </div>

        );
    }
}

ByModule.propTypes = {
    actions: PropTypes.object.isRequired,
    value: PropTypes.any,
    module: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    fetch: PropTypes.func.isRequired
};

export default connect(
    ({cardReasonFilterByAction, cardReasonFilterByModule}) => {
        return {
            module: cardReasonFilterByModule.get('value'),
            actions: cardReasonFilterByAction.get('data'),
            value: cardReasonFilterByAction.get('value')
        };
    },
    {fetch, onSelect}
)(ByModule);
