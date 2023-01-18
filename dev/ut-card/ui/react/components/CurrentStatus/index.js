import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Text from 'ut-front-react/components/Text';
import style from './style.css';

export class CurrentStatus extends Component {
    getStyle(name) {
        return this.props.externalStyle[name] || this.context.implementationStyle[name] || style[name];
    }
    render() {
        let cardDetCurrentStatus = 'cardDetCurrentStatus' + ((this.props.details) ? 'Details' : '');
        let cardDetCurrentStatusStatus = 'cardDetCurrentStatusStatus' + ((this.props.details) ? 'Details' : '');
        let cardDetCurrentStatusWrapper = 'cardDetCurrentStatusWrapper' + ((this.props.details) ? 'Details' : '');
        let cardDetCurrentStatusLabel = 'cardDetCurrentStatusLabel' + ((this.props.details) ? 'Details' : '');

        return (
            <div className={[this.getStyle(cardDetCurrentStatus), this.getStyle(`${cardDetCurrentStatus}${this.props.status.label}`)].join(' ')}>
                <div className={this.getStyle(cardDetCurrentStatusWrapper)}>
                    {this.props.details && (<div className={this.getStyle(cardDetCurrentStatusLabel)}><Text>Status</Text></div>)}
                    <div className={[this.getStyle(cardDetCurrentStatusStatus), this.getStyle(`${cardDetCurrentStatusStatus}${this.props.status.label}`)].join(' ')}><Text>{this.props.status.name}</Text></div>
                </div>
            </div>
        );
    }
}

CurrentStatus.propTypes = {
    externalStyle: PropTypes.object,
    statusId: PropTypes.number.isRequired,
    status: PropTypes.object.isRequired,
    details: PropTypes.bool,
    page: PropTypes.oneOf(['application', 'card', 'batch', 'cardInUse']).isRequired
};

CurrentStatus.defaultProps = {
    externalStyle: {},
    status: {}
};

CurrentStatus.contextTypes = {
    implementationStyle: PropTypes.object
};

export default connect(
    (state, ownProps) => {
        var status = (state.utCardStatusAction.get(`filter-${ownProps.page}`) || []).filter((item) => {
            return ownProps.statusId === item.key;
        });
        return {
            status: status.pop() || (ownProps.status && {label: ownProps.status.label, name: ownProps.status.name})
        };
    }
)(CurrentStatus);
