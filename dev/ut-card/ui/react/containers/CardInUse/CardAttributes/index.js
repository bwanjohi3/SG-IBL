import React from 'react';
import { connect } from 'react-redux';
import CardAttributes from 'ut-front-react/components/AttributesSection';
// import types from 'ut-front-react/components/AttributesSection/types';
import CurrentStatus from '../../../components/CurrentStatus';

const mapDataStatus = (data) => {
    return data.set('statusNode', (<CurrentStatus statusId={data.get('statusId')} page='cardInUse' />));
};

const selectedSourceKeys = [
    { name: 'Status', key: ['statusNode'] },
    { name: 'Customer Name', key: ['customerName'] },
    { name: 'Person Name', key: ['personName'] },
    { name: 'Customer Number', key: ['customerNumber'] },
    { name: 'Card Product', key: ['productName'] },
    { name: 'Card Number', key: ['cardNumber'] },
    { name: 'Business Unit', key: ['currentBranchName'] },
    { name: 'Plastic Name', key: ['cardHolderName'] },
    { name: 'Expiry Date', key: ['expirationDate'] },
    { name: 'Last Modified', key: ['lastModified'] }
];

export default connect(
    ({ cardInUseGrid }, ownProps) => ({
        selectedSourceData: selectedSourceKeys,
        singleItemName: 'card',
        selected: cardInUseGrid.get('checkedRows').size === 1 ? mapDataStatus(cardInUseGrid.get('checkedRows').toList().get(0)) : undefined,
        checked: cardInUseGrid.get('checkedRows').toList(),
        checkedMapKey: 'cardNumber',
        isInfoLoading: cardInUseGrid.get('isInfoLoading'),
        hasPermissions: ownProps.hasPermissions
    })
)(CardAttributes);
