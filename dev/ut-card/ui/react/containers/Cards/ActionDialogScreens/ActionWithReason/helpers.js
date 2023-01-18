export function parseRequestParams(cards, inputReason) {
    return cards.map((card) => {
        return {
            cardId: card.get('cardId') | 0,
            statusId: card.get('statusId') | 0,
            reasonId: inputReason.get('reasonId') | 0 || undefined,
            comments: inputReason.get('comment') || undefined
        };
    }).toJS();
};
