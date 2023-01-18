export function parseFilters(filterData) {
    let parsed = {};
    if (filterData) {
        let isActive = filterData.get('byStatus') >= 0 ? filterData.get('byStatus') : undefined;
        let paging = {
            pageSize: filterData.getIn(['byPage', 'pageSize']),
            pageNumber: filterData.getIn(['byPage', 'pageNumber'])
        };
        let orderBy = filterData.get('orderBy');
        let reasonName = filterData.get('byReasonName');
        let module = filterData.get('byModule');
        let actionId = filterData.get('byAction');

        parsed = {
            filterBy: {
                module,
                actionId,
                isActive,
                reasonName
            },
            paging,
            orderBy
        };
    }
    return parsed;
};
