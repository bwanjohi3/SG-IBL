export function prepareBinToUpdate(binData) {
    let binParams = {
        binId: binData.get('binId'),
        ownershipTypeId: binData.get('ownershipTypeId'),
        startBin: binData.get('startBin'),
        endBin: binData.get('endBin'),
        description: binData.get('description')
    };

    return binParams;
};
