export const actionList = {
    FETCH: Symbol('FETCH'),
    FETCH_STATUSES: Symbol('FETCH_STATUSES'),
    FETCH_EMBOSSED_TYPES: Symbol('FETCH_EMBOSSED_TYPES'),
    FETCH_OWNERSHIP_TYPES: Symbol('FETCH_OWNERSHIP_TYPES')
};

export const fetch = () => ({type: actionList.FETCH, params: {}, method: 'card.config.fetch'});
export const fetchStatuses = () => ({type: actionList.FETCH_STATUSES, params: {}, method: 'card.status.list'});
export const fetchEmbossedTypes = () => ({type: actionList.FETCH_EMBOSSED_TYPES, params: {}, method: 'card.embossedType.fetch'});
export const fetchOwnershipTypes = () => ({type: actionList.FETCH_OWNERSHIP_TYPES, params: {}, method: 'card.ownershipType.fetch'});
