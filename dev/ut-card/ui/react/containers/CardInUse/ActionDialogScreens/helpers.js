export function parseCardsRequestParams(cards) {
    return cards.toList().toJS().map((card) => {
        return {
            cardId: card.cardId | 0,
            statusId: card.statusId | 0
        };
    });
};
