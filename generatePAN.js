'use strict';
const crypto = require('crypto');
const mssql = require('ut-mssql');
const config = {
    dbUser: 'sa',
    dbPass: 'sg@admin1234',
    dbHost: 'devdb08',
    dbName: 'impl-standard-krasimir-kolev',

    key: 'a password',
    generate: [{
        startNumber: 6361600000000000,
        count: 100,
        generate: true,
        cardNumberConstructionIds: [], // [1, 2, 3],
        isUsed: 0,
        binIds: [], // [1],
        branchIds: [] // [1132, 1001, 1107, 1108, 1110, 1122, 1129, 1130, 1131, 1133]
    }]
};
const selectCardNumberConstructionIds = 'SELECT [cardNumberConstructionId] FROM [card].[cardNumberConstruction]';
const selectBinIds = 'SELECT [binId] FROM [card].[bin]';
const selectBranchIds = 'SELECT [actorId] FROM [customer].[organization] WHERE isEnabled = 1 AND isDeleted = 0';
/* eslint-disable no-console */
function generator(count, startFrom) {
    startFrom = parseInt(startFrom || 0, 10);
    // generate
    let cards = (new Array(count))
        .fill(startFrom)
        .map((v, idx) => {
            return v + idx + 1;
        });
    return {cards, lastCardNum: cards[cards.length - 1]};
}
function sqlGen(config, key) {
    return config.cardNumberConstructionIds
        .reduce((prev, cardNumberConstructionId) => {
            return config.binIds
                .reduce((prev, binId) => {
                    return config.branchIds
                        .reduce((prev, branchId) => {
                            var generated = generator(config.count, config.startNumber);
                            config.startNumber = generated.lastCardNum;
                            return prev.concat(generated.cards.map((card) => {
                                return {number: card.toString(), cardNumberConstructionId, binId, branchId};
                            }));
                        }, prev);
                }, prev);
        }, [])
        .map((card) => {
            const cipher = crypto.createCipher('aes256', key);
            return `INSERT INTO [card].[number] (last4Digits, pan, cardNumberConstructionId, binId, branchId, isUsed)
             VALUES ('${card.number.slice(-4)}', '${cipher.update(card.number.toString(), 'hex', 'hex') + cipher.final('hex')}', '${card.cardNumberConstructionId}', '${card.binId}', '${card.branchId}', 0)`;
        });
}
mssql.connect(`mssql://${config.dbUser}:${config.dbPass}@${config.dbHost}/${config.dbName}?requestTimeout=600000`).then(() => {
    // select cardNumberConstructionIds
    if (config.generate[0].cardNumberConstructionIds.length === 0) {
        return (new mssql.Request()).batch(selectCardNumberConstructionIds);
    }
    return undefined;
})
.then((cardNumberConstructionIds) => {
    if (cardNumberConstructionIds) {
        config.generate[0].cardNumberConstructionIds = cardNumberConstructionIds.map((value) => {
            return value.cardNumberConstructionId;
        });
    };
    // select binIds
    if (config.generate[0].binIds.length === 0) {
        return (new mssql.Request()).batch(selectBinIds);
    }
    return undefined;
})
.then((binIds) => {
    if (binIds) {
        config.generate[0].binIds = binIds.map((value) => {
            return value.binId;
        });
    }
    // select branchIds
    if (config.generate[0].branchIds.length === 0) {
        return (new mssql.Request()).batch(selectBranchIds);
    }
    return undefined;
})
.then((branchIds) => {
    if (branchIds) {
        config.generate[0].branchIds = branchIds.map((value) => {
            return parseInt(value.actorId);
        });
    }
    let sqlBatch = config.generate.reduce((prev, curConf) => {
        let res = sqlGen(curConf, config.key);
        return prev.concat(res);
    }, []).join(';\n');
    console.log('batch insert start');
    return (new mssql.Request()).batch(sqlBatch);
})
.then((r) => {
    return console.log('all done');
})
.catch(err => console.error(err));
