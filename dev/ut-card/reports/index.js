module.exports = (gridStyle) => ({
    ListOfCards: require('./listOfCards')(gridStyle),
    SMSAlerts : require('./SMSAlerts')(gridStyle)
});
