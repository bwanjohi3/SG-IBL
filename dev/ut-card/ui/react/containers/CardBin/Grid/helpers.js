export function parseFilters(filterData) {
    let parsed = {};
    if (filterData) {
        let active = filterData.get('byStatus') >= 0 ? filterData.get('byStatus') : undefined;
        let paging = {
            pageSize: filterData.getIn(['byPage', 'pageSize']),
            pageNumber: filterData.getIn(['byPage', 'pageNumber'])
        };
        let orderBy = filterData.get('orderBy');
        let reasonName = filterData.get('byReasonName');
        let module = filterData.get('byModule');
        let actId = filterData.get('byAction');

        parsed = {
            module,
            actId,
            active,
            paging,
            orderBy,
            reasonName
        };
    }
    return parsed;
};
