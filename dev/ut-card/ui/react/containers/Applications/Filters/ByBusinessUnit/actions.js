import * as actionTypes from './actionTypes';

export function setParentBusinessUnit(businessUnit, breadcrumbs) {
    return {
        type: actionTypes.SET_PARENT_BUSINESS_UNIT,
        businessUnitId: (businessUnit ? businessUnit.id : undefined),
        breadcrumbs: breadcrumbs
    };
}
