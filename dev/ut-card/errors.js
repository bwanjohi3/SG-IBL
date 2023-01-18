var create = require('ut-error').define;
module.exports = [
    {
        name: 'card.application.add.submittedAccountsAreNotAtThatCustomer',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.add',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.statusUpdate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.statusUpdateCreateBatch',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.statusUpdateEdit',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.batch',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.batch.addNoNameBatch',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.Batch',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.Batch.statusUpdate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.card',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.card.statusUpdate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.cardInUse',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.cardInUse.statusUpdate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.cardInUse.statusUpdateEdit',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.noNameApplication',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.noNameApplication.add',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.product',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.product.add',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.add.submittedPersonAreNotAtThatCustomer',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.add.submittedAccountIsDuplicate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.add.submittedAccountOrderIsDuplicate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.add.thereShouldBeExactlyOnePrimaryAccount',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.statusUpdate.NotAllInTheSameTargetStatus',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.statusUpdateCreateBatch.loggedUserWithMoreThanOneBranch',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.statusUpdateEdit.submittedAccountsAreNotAtThatCustomer',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.statusUpdateEdit.submittedPersonAreNotAtThatCustomer',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.statusUpdateEdit.submittedAccountIsDuplicate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.statusUpdateEdit.submittedAccountOrderIsDuplicate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.statusUpdateEdit.thereShouldBeExactlyOnePrimaryAccount',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.batch.addNoNameBatch.loggedUserWithMoreThanOneBranch',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.Batch.statusUpdate.NotAllInTheSameTargetStatus',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.card.statusUpdate.notAllInTheSameTargetStatus',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.card.statusUpdate.securityViolation',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.cardInUse.statusUpdate.securityViolation',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.cardInUse.statusUpdateEdit.submittedAccountsAreNotAtThatCustomer',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.cardInUse.statusUpdateEdit.submittedAccountIsDuplicate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.cardInUse.statusUpdateEdit.submittedAccountOrderIsDuplicate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.cardInUse.statusUpdateEdit.thereShouldBeExactlyOnePrimaryAccount',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.noNameApplication.add.submittedAccountsAreNotAtThatCustomer',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.noNameApplication.add.submittedPersonAreNotAtThatCustomer',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.noNameApplication.add.submittedAccountIsDuplicate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.noNameApplication.add.submittedAccountOrderIsDuplicate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.noNameApplication.add.thereShouldBeExactlyOnePrimaryAccount',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.application.add.loggedUserWithMoreThanOneBranch',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.product.add.startDateBiggerThanEndDate',
        defaultMessage: 'ut-card error'
    },
    {
        name: 'card.cantAddInThisBranch',
        defaultMessage: 'ut-card error'
    }
].reduce(function(prev, next) {
    var spec = next.name.split('.');
    var Ctor = create(spec.pop(), spec.join('.'), next.defaultMessage);
    prev[next.parent ? next.parent + '.' + next.name : next.name] = function(params) {
        return new Ctor({params: params});
    };
    return prev;
}, {});
