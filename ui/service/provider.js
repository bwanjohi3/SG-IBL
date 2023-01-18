import React, {Component, PropTypes, Children} from 'react';
import implementationStyle from './assets/react/index.css';
import {getLink, registerRoute} from 'ut-front/react/routerHelper';

registerRoute('ut-impl:dashboard').path('/');

export default class Provider extends Component {
    getChildContext() {
        return {
            implementationStyle: implementationStyle,
            mainUrl: getLink('ut-impl:dashboard'),
            mainTabset: [{
                routeName: 'ut-impl:dashboard',
                title: <div className={implementationStyle.homeIcon} />,
                props: {
                    activeClassName: 'active'
                }
            }, {
                routeName: 'ut-customer:customers',
                title: 'Customers',
                permission: ['service.customer.customer.nav'],
                props: {
                    activeClassName: implementationStyle.active
                }
            }, {
                routeName: 'ut-customer:customers',
                title: 'Agents & Merchants',
                permission: ['service.customer.customer.nav'],
                props: {
                    activeClassName: implementationStyle.active
                }
            }, {
                routeName: 'ut-transfer:transactions',
                title: 'Transactions',
                permission: ['service.bulk.transactions.nav'],
                props: {
                    activeClassName: implementationStyle.active
                },
                multi: [{
                    routeName: 'ut-bulk:bulkBatch',
                    title: 'Bulk',
                    permission: ['service.bulk.batch.nav'],
                    props: {
                        activeClassName: implementationStyle.active
                    },
                    multi: [{
                        routeName: 'ut-bulk:bulkBatchDebit',
                        title: 'Bulk Debits',
                        permission: ['service.bulk.batch.bulkDebit'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }, {
                        routeName: 'ut-bulk:bulkBatchCredit',
                        title: 'Bulk Credits',
                        permission: ['service.bulk.batch.bulkCredit'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }, {
                        routeName: 'ut-bulk:bulkBatchCreditMerchants',
                        title: 'Bulk Credits - Merchant',
                        permission: ['service.bulk.batch.merchantBulkCredit'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }]
                }]
            }, {
                routeName: 'ut-card:home',
                title: 'Cards',
                permission: ['service.card.config.fetch'],
                props: {
                    activeClassName: implementationStyle.active
                },
                multi: [{
                    routeName: 'ut-card:application',
                    title: 'Applications',
                    permission: ['service.card.application.fetch'],
                    props: {
                        activeClassName: implementationStyle.active
                    }
                }, {
                    routeName: 'ut-card:batch',
                    title: 'Batches',
                    permission: ['service.card.batch.fetch'],
                    props: {
                        activeClassName: implementationStyle.active
                    }
                }, {
                    routeName: 'ut-card:cards',
                    title: 'Cards in Production',
                    permission: ['service.card.cardInProduction.fetch'],
                    props: {
                        activeClassName: implementationStyle.active
                    }
                }, {
                    routeName: 'ut-card:cardInUse',
                    title: 'Cards in Use',
                    permission: ['service.card.cardInUse.fetch'],
                    props: {
                        activeClassName: implementationStyle.active
                    }
                }, {
                    routeName: 'ut-card:cardProduct',
                    title: 'Card Products',
                    permission: ['service.card.product.fetch'],
                    props: {
                        activeClassName: implementationStyle.active
                    }
                }, {
                    routeName: 'ut-card:cardBin',
                    title: 'Card BINs',
                    permission: ['service.card.bin.get'],
                    props: {
                        activeClassName: implementationStyle.active
                    }
                }]

            }, {
                title: 'Operations',
                permission: ['service.customer.referral.fetch'],
                props: {
                    activeClassName: implementationStyle.active
                },
                multi: [
                    {
                        routeName: 'ut-customer:customerReferrals',
                        title: 'Referrals Management',
                        permission: ['service.customer.referral.fetch'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }
                ]
            }]
        };
    }
    render() {
        let { children } = this.props;
        return Children.only(children);
    }
}

Provider.childContextTypes = {
    implementationStyle: PropTypes.object,
    reports: PropTypes.object,
    mainUrl: PropTypes.string,
    mainTabset: PropTypes.array,
    cards: PropTypes.object
};

Provider.propTypes = {
    children: PropTypes.node
};
