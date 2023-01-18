import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

import {updatePage} from './actions';

import CardDetailsPopup from './Details';
import ConfirmActionPopup from './ConfirmAction';
import CardRelocationPopup from './Relocate';
import CardActionWithReasonPopup from './ActionWithReason';

class CardActionDialogScreens extends Component {
    componentWillReceiveProps(nextProps) {
        if (nextProps.changeId !== this.props.changeId) {
            this.props.updatePage();
        }
    };
    render() {
        return (
            <div>
                { this.props.detailsOpen && <CardDetailsPopup /> }
                { this.props.relocationOpen && <CardRelocationPopup /> }
                { this.props.actionWithReasonOpen && <CardActionWithReasonPopup /> }
                { this.props.confirmationOpen && <ConfirmActionPopup />}
            </div>
        );
    }
};
CardActionDialogScreens.propTypes = {
    // data
    detailsOpen: PropTypes.bool.isRequired,
    relocationOpen: PropTypes.bool.isRequired,
    actionWithReasonOpen: PropTypes.bool.isRequired,
    confirmationOpen: PropTypes.bool.isRequired,

    changeId: PropTypes.number.isRequired,

    // actions
    updatePage: PropTypes.func.isRequired
};
export default connect(({
    cardDetailsPopup,
    cardRelocationPopup,
    cardActionWithReason,
    cardConfirmActionPopup
}) => ({
    detailsOpen: cardDetailsPopup.get('open'),
    relocationOpen: cardRelocationPopup.get('open'),
    actionWithReasonOpen: cardActionWithReason.get('open'),
    confirmationOpen: cardConfirmActionPopup.get('open'),

    changeId: (
        cardRelocationPopup.get('changeId') +
        cardActionWithReason.get('changeId') +
        cardConfirmActionPopup.get('changeId')
    )
}),
{updatePage})(CardActionDialogScreens);
