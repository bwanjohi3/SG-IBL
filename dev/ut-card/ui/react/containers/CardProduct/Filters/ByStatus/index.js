import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import {changeStatusFilter} from './actions';

export class ByStatus extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(record) {
        if (record.value !== record.initValue) {
            var newStatusFilter;
            switch (record.value) {
                case 0:
                    newStatusFilter = false;
                    break;
                case 1:
                    newStatusFilter = true;
                    break;
                default:
                    newStatusFilter = '__placeholder__';
                    break;
            }
            this.props.changeStatusFilter(newStatusFilter);
        }
    }

    render() {
        return (
            <div style={this.props.style} className={this.props.className}>
                <Dropdown
                  canSelectPlaceholder
                  placeholder='Status'
                  defaultSelected={this.props.status}
                  keyProp='name'
                  onSelect={this.handleSelect}
                  data={this.props.data}
                />
            </div>
        );
    }
}

ByStatus.propTypes = {
    status: PropTypes.any,
    data: PropTypes.array.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    changeStatusFilter: PropTypes.func
};

export default connect(
    (state, ownProps) => {
        return {
            status: (() => {
                switch (state.cardProductStatusFilter.get('isActive')) {
                    case true:
                        return 1;
                    case false:
                        return 0;
                    case '':
                        return '__placeholder__';
                }
            })()
        };
    }, {changeStatusFilter}
)(ByStatus);
