var defaultQuantityLowLimit = 0;

function checkQuantity(port, batchId, $meta) {
    return port.super['card.batch.check']({batchId}, $meta)
        .then((check) => {
            return check.pop();
        });
}
function filterLowLimit(quantityLowLimit, quantityCheckInfo) {
    return quantityCheckInfo.reduce((prev, cur) => {
        if ((cur.available - cur.needed) < quantityLowLimit) {
            return prev.concat([cur]);
        }
        return prev;
    }, []);
}
function quantityRefill(port, $meta, data) {
    return data.reduce((prev, item) => {
        return prev.then(() => (
            port.super['card.generated.add']({
                pans: item.response.pans.list,
                binId: item.quantityCheckInfo.binId,
                cardNumberConstructionId: item.quantityCheckInfo.cardNumberConstructionId,
                branchId: item.quantityCheckInfo.branchId,
                next: item.response.next
            }, $meta)
        ));
    }, Promise.resolve());
}

function getCards(port, $meta, generateArgs) {
    return port.bus.importMethod('pan.number.generate')({
        panLength: generateArgs.cardLength,
        count: (port.config.card.quantityLowLimit || defaultQuantityLowLimit) + generateArgs.needed,
        checkSum: generateArgs.generateControlDigit,
        start: generateArgs.next,
        prefix: generateArgs.prefix,
        cipher: generateArgs.cipher
    });
}

function quantityCheckAndRefill(port, $meta, batchId) {
    return checkQuantity(port, batchId, $meta) // get info for generated cards quantity, is there enough of them per batch.
        .then((quantityCheckInfo) => {
            if (quantityCheckInfo.length) { // if there is result, continue further
                var filteredLowLimit = filterLowLimit((port.config.card.quantityLowLimit || defaultQuantityLowLimit), quantityCheckInfo); // filter result where lower generated card exceeded
                return Promise.all(filteredLowLimit.map((quantityCheckInfoItem) => {
                    // do card generation request
                    return getCards(port, $meta, quantityCheckInfoItem)
                    .then((response) => {
                        return {response, quantityCheckInfo: quantityCheckInfoItem};
                    });
                }));
            }
            return [];
        })
        .then((data) => {
            var errorCheck = data.filter((item) => {
                return !!(item.response && item.response.pans && item.response.next);
            }, false);
            if (errorCheck.length !== data.length) {
                throw new Error('There is error while generating new cards');
            }
            return quantityRefill(port, $meta, data);
        });
}

module.exports = {
    'request.send': function(params, $meta) { // generate cards by hand: https://git.softwaregroup-bg.com/ut5impl/impl-nbv-atm/blob/master/test/db/generatePAN.js
        // card quantity check if there is batchId in params
            // if card quantity is below min
                // generate, insert cards
        // send to production
        if (!params.batch || !params.batch.batchId) {
            return params;
        }
        return quantityCheckAndRefill(this, $meta, params.batch.batchId)
        .then(() => {
            return params;
        });
    }
};
