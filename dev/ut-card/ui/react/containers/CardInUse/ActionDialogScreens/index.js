import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import {updatePage} from './actions';

import CardInUseDetailsPopup from '../Details';
import CardInUseUpdatePopup from './Update';
import CardInUseConfirmActionPopup from './ConfirmAction';
import CardInUseActionWithReasonPopup from './ActionWithReason';

class CardInUseActionDialogScreens extends Component {
    componentWillReceiveProps(nextProps) {
        if (nextProps.changeId !== this.props.changeId) {
            this.props.updatePage();
        }
    };
    render() {
        return (
            <div>
                { this.props.detailsOpen && <CardInUseDetailsPopup /> }
                { this.props.updateOpen && <CardInUseUpdatePopup />}
                { this.props.confrimOpen && <CardInUseConfirmActionPopup />}
                { this.props.actionWithReasonOpen && <CardInUseActionWithReasonPopup />}
            </div>
        );
    }
};
CardInUseActionDialogScreens.propTypes = {
    // data
    detailsOpen: PropTypes.bool.isRequired,
    updateOpen: PropTypes.bool.isRequired,
    confrimOpen: PropTypes.bool.isRequired,
    actionWithReasonOpen: PropTypes.bool.isRequired,

    changeId: PropTypes.number.isRequired,

    // actions
    updatePage: PropTypes.func.isRequired
};
export default connect(({
    cardInUseDetails,
    cardInUseUpdatePopup,
    cardInUseConfirmActionPopup,
    cardInUseActionWithReason
}) => ({
    detailsOpen: cardInUseDetails.get('id') > 0,
    updateOpen: cardInUseUpdatePopup.get('open'),
    confrimOpen: cardInUseConfirmActionPopup.get('open'),
    actionWithReasonOpen: cardInUseActionWithReason.get('open'),

    changeId: (
        cardInUseUpdatePopup.get('changeId') +
        cardInUseConfirmActionPopup.get('changeId') +
        cardInUseActionWithReason.get('changeId')
    )
}),
{updatePage})(CardInUseActionDialogScreens);
