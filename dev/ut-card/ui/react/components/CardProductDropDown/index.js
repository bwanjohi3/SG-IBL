import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';

class CardProductDropDown extends Dropdown {
    render() {
        return (<Dropdown {...this.props} disabled={this.props.linkedCount > 0} />);
    }
};

CardProductDropDown.propTypes = {
    linkedCount: PropTypes.number,
    appType: PropTypes.string
};

export default connect(
    (state, ownProps) => {
        var linkedCount;
        if (ownProps.appType === 'name') {
            linkedCount = state.cardNameApplicationAccounts.getIn(['data', 'linked']).size;
        }

        return {
            linkedCount
        };
    }
)(CardProductDropDown);
