module.exports = (bus) => ({
    securityCodeCurrency: (code) => '123', // todo
    card: bus.importMethod('transfer.card.execute'),
    h2hTransaction: bus.importMethod('h2h/transfer.push.execute'),
    h2hReversal: bus.importMethod('h2h/transfer.push.reverse'),
    tssConfirmMCExtNI: bus.importMethod('tss/transfer.push.confirm'),
    event: bus.importMethod('db/transfer.push.event'),
    requestAcquirer: bus.importMethod('db/transfer.push.requestAcquirer'),
    confirmAcquirer: bus.importMethod('db/transfer.push.confirmAcquirer'),
    failAcquirer: bus.importMethod('db/transfer.push.failAcquirer'),
    checkLastTransaction: bus.importMethod('db/transfer.push.checkLastTransaction')
});
