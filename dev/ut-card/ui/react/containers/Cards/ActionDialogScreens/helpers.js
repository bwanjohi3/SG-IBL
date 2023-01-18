export function parseCardsRequestParams(cards) {
    return cards.map((card) => {
        return {
            cardId: card.get('cardId') | 0,
            statusId: card.get('statusId') | 0
        };
    }).toJS();
};
