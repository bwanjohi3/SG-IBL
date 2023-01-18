export function parseLinkedAccountsRequestParams(accounts) {
    return accounts.toList().toJS().map((account, idx) => {
        let mappedAccount = {
            accountNumber: account.accountNumber,
            accountTypeName: account.accountTypeName,
            cardAccountId: account.cardAccountId || undefined,
            currency: account.currency,
            isPrimary: account.isPrimary,
            isLinked: account.isLinked,
            cardId: account.cardId,
            accountOrder: idx + 1
        };
        if (account.accountLinkId) {
            mappedAccount.accountLinkId = account.accountLinkId;
        }
        return mappedAccount;
    });
};

export function parseCardsRequestParams(cards, inputReason) {
    return cards.toList().toJS().map((card) => {
        return {
            cardId: card.cardId | 0,
            statusId: card.statusId | 0,
            personNumber: card.personNumber,
            customerNumber: card.customerNumber,
            reasonId: inputReason.get('reasonId') > 0 ? inputReason.get('reasonId') : undefined,
            comments: inputReason.get('comment') || undefined
        };
    });
};
