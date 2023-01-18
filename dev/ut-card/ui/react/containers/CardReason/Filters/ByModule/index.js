import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Text from 'ut-front-react/components/Text';
import {set as onSelect} from './actions';

import {getModules} from '../../helpers';

export class ByModule extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
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
        return (
            <div>
                <Dropdown
                  placeholder={<Text>Module</Text>}
                  onSelect={this.handleSelect}
                  canSelectPlaceholder
                  data={this.props.data}
                  defaultSelected={this.props.value}
                />
            </div>

        );
    }
}

ByModule.propTypes = {
    data: PropTypes.array.isRequired,
    value: PropTypes.any,
    onSelect: PropTypes.func.isRequired
};

export default connect(
    ({cardReasonFilterByModule, cardReasonFilterByAction}) => {
        return {
            data: getModules(cardReasonFilterByAction.get('data'))
                .map(item => {
                    return {
                        key: item.key,
                        name: <Text>{item.name}</Text>
                    };
                }),
            value: cardReasonFilterByModule.get('value')
        };
    },
    {onSelect}
)(ByModule);
