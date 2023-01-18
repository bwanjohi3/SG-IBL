export const actionsList = {
    'SET_PARENT_BUSINESS_UNIT': Symbol('SET_PARENT_BUSINESS_UNIT_CARD_PRODUCT')
};

export function setParentBusinessUnit(businessUnit, breadcrumbs) {
    return {
        type: actionsList.SET_PARENT_BUSINESS_UNIT,
        businessUnitId: (businessUnit ? businessUnit.id : undefined),
        breadcrumbs: breadcrumbs
    };
}
