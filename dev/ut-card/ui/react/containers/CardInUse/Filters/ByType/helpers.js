export function parseFetchedTypes(types) {
    return types.map((type) => {
        return {
            key: type.typeId,
            name: type.name
        };
    });
};
