export function parseFilters(filterData) {
    let parsed = {};
    if (filterData) {
        let filterBy = {
            statusId: filterData.get('byStatus') ? filterData.get('byStatus') | 0 : undefined,
            currentBranchId: filterData.get('byBusinessUnit') ? filterData.get('byBusinessUnit') | 0 : undefined,
            issuingBranchId: filterData.get('issuingBusinessUnitId') ? filterData.get('issuingBusinessUnitId') | 0 : undefined,
            targetBranchId: filterData.get('byTargetBusinessUnit') ? filterData.get('byTargetBusinessUnit') | 0 : undefined,
            productId: filterData.get('byProduct') ? filterData.get('byProduct') | 0 : undefined
        };
        let paging = {
            pageSize: filterData.getIn(['byPage', 'pageSize']),
            pageNumber: filterData.getIn(['byPage', 'pageNumber'])
        };
        let orderBy = filterData.get('orderBy');

        parsed = {
            filterBy,
            paging,
            orderBy
        };

        let customSearchField = filterData.getIn(['byCustomSearch', 'field']);
        let customSearchValue = filterData.getIn(['byCustomSearch', 'value']);

        if (customSearchField && customSearchValue) {
            parsed.filterBy[customSearchField] = customSearchValue;
        }
    }
    return parsed;
};
