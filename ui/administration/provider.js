import React, {Component, PropTypes, Children} from 'react';
import implementationStyle from './assets/react/index.css';
import {getDocsUrl} from './config/docs.config';
import {getLink, registerRoute} from 'ut-front/react/routerHelper';

registerRoute('ut-impl:dashboard').path('/');

export default class Provider extends Component {
    getChildContext() {
        return {
            implementationStyle: implementationStyle,
            mainUrl: getLink('ut-impl:dashboard'),
            getDocsUrl: getDocsUrl,
            mainTabset: [{
                routeName: 'ut-impl:dashboard',
                title: <div className={implementationStyle.homeIcon} />,
                props: {
                    activeClassName: implementationStyle.active
                }
            }, {
                routeName: 'ut-user:businessUnits',
                title: 'Organizations',
                permission: ['customer.organization.nav'],
                props: {
                    activeClassName: implementationStyle.active
                },
                multi: [
                    {
                        routeName: 'ut-user:businessUnits',
                        title: 'Business Units Management',
                        permission: ['customer.bu.nav'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }
                ]
            }, {
                routeName: 'ut-user:roles',
                title: 'Roles & Users',
                permission: ['user.admin.nav'],
                props: {
                    activeClassName: implementationStyle.active
                },
                multi: [
                    {
                        routeName: 'ut-user:accesspolicy',
                        title: 'Access Policies Management',
                        permission: ['user.access.nav'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    },
                    {
                        routeName: 'ut-user:roles',
                        title: 'Roles & Permissions Management',
                        permission: ['user.role.nav'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    },
                    {
                        routeName: 'ut-user:accesspermissions',
                        title: 'Permissions Bulk Management',
                        permission: ['user.permissions.nav'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    },
                    {
                        routeName: 'ut-user:users',
                        title: 'Users Management',
                        permission: ['user.user.nav'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }
                ]
            },  {
                routeName: 'ut-rule:home',
                title: 'Rules',
                permission: ['rule.rule.nav'],
                props: {
                    activeClassName: implementationStyle.active
                },
                multi: [{
                    routeName: 'ut-rule:home',
                    title: 'Fees and Limits',
                    permission: ['rule.rule.fetch'],
                    props: {
                        activeClassName: implementationStyle.active
                    }
                }]
            }, 
            /*{
                routeName: 'ut-system',
                title: 'System',
                permission: ['user.system.nav'],
                props: {
                    activeClassName: 'active'
                },
                multi: [
                    {
                        routeName: 'ut-core:items',
                        title: 'Content Items & Translations',
                        permission: ['core.content.nav'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }, {
                        routeName: 'ut-user:systemerrormessages',
                        title: 'Error Messages',
                        permission: ['user.errors.fetch'],
                        props: {
                            activeClassName: 'active'
                        }
                    }, {
                        routeName: 'ut-user:systemexternalsystems',
                        routeParams: {},
                        title: 'External System Integrations',
                        permission: ['user.externalSystem.fetch'],
                        props: {
                            activeClassName: 'active'
                        }
                    }, {
                        routeName: 'ut-system:systemexternalsystemcredentials',
                        routeParams: {},
                        title: 'External System Credentials',
                        permission: ['user.externalUser.fetch'],
                        props: {
                            activeClassName: 'active'
                        }
                    }, {
                        routeName: 'ut-transfer:partners',
                        title: 'Transfer Partners and Card Issuers',
                        permission: ['transfer.partner.fetch'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }
                ]
            },
            */
             {
                routeName: 'ut-card:home',
                title: 'Cards',
                permission: ['card.config.fetch'],
                props: {
                    activeClassName: implementationStyle.active
                },
                multi: [{
                    routeName: 'ut-card:application',
                    title: 'Applications',
                    permission: ['card.application.fetch'],
                    props: {
                        activeClassName: implementationStyle.active
                    }
                }, {
                    routeName: 'ut-card:batch',
                    title: 'Batches',
                    permission: ['card.batch.fetch'],
                    props: {
                        activeClassName: implementationStyle.active
                    }
                }, {
                    routeName: 'ut-card:cards',
                    title: 'Cards in Production',
                    permission: ['card.cardInProduction.fetch'],
                    props: {
                        activeClassName: implementationStyle.active
                    }
                }, {
                    routeName: 'ut-card:cardInUse',
                    title: 'Cards in Use',
                    permission: ['card.cardInUse.fetch'],
                    props: {
                        activeClassName: implementationStyle.active
                    }
                }, {
                    routeName: 'ut-card:administration',
                    title: 'Administration',
                    permission: [],
                    props: {
                        activeClassName: implementationStyle.active
                    },
                    multi: [{
                        routeName: 'ut-card:cardProduct',
                        title: 'Card Products',
                        permission: ['card.product.fetch'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }, {
                        routeName: 'ut-card:cardType',
                        title: 'Card Types',
                        permission: ['card.type.fetch'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }, {
                        routeName: 'ut-card:cardReason',
                        title: 'Card Reasons',
                        permission: ['card.reason.fetch'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }, {
                        routeName: 'ut-card:cardBin',
                        title: 'Card BINs',
                        permission: ['card.bin.get'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }, {
                        routeName: 'ut-card:pinMailerFormat',
                        title: 'PIN Mailer Format',
                        permission: null,
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }, {
                        routeName: 'ut-card:pinMailerFile',
                        title: 'PIN Mailer File',
                        permission: ['card.pinMailerFile.fetch'],
                        props: {
                            activeClassName: implementationStyle.active
                        }
                    }]
                }]
            },           
             {
                routeName: 'ut-ctp',
                title: 'ATM',
                permission: ['db/atm.terminal.fetch', 'core.itemCode.fetch'],
                props: {
                    activeClassName: 'active'
                },
                multi: [
                    {
                        routeName: 'ut-ctp:atm:terminal',
                        title: 'Terminals',
                        permission: ['db/atm.terminal.fetch', 'core.itemCode.fetch'],
                        props: {
                            activeClassName: 'active'
                        }
                    }]
            }, 
            {
                routeName: 'ut-pos',
                title: 'POS',
                permission: ['db/pos.terminal.fetch', 'core.itemCode.fetch'],
                props: {
                    activeClassName: 'active'
                },
                multi: [
                    {
                        routeName: 'ut-pos:terminal',
                        title: 'Terminals',
                        permission: ['db/pos.terminal.fetch', 'core.itemCode.fetch'],
                        props: {
                            activeClassName: 'active'
                        }
                    },
                    {
                        routeName: 'ut-pos:application',
                        title: 'Pos Firmware',
                        permission: ['db/pos.application.fetch'],
                        props: {
                            activeClassName: 'active'
                        }
                    },
                    {
                        routeName: 'ut-pos:binList',
                        title: 'Bin List',
                        permission: ['db/pos.binList.fetch'],
                        props: {
                            activeClassName: 'active'
                        }
                    }
                ]
            },
            {
                routeName: 'ut-report:reports',
                title: 'Reports',
                permission: ['report.report.nav'],
                props: {
                    activeClassName: implementationStyle.active
                },
                multi: [{
                    routeName: 'ut-report:report:card',
                    title: 'Cards',
                    permission: ['report.card.nav'],
                    props: {
                        activeClassName: 'active'
                    },
                    multi: [{
                        routeName: 'ut-report:report',
                        routeParams: {name: 'ListOfCards'},
                        title: 'List of Cards',
                        permission: ['card.report.listOfCards'],
                        props: {
                            activeClassName: 'active'
                        }
                    }]
                },
                {
                    routeName: 'ut-report:report:card',
                    title: 'SMS Alerts',
                    permission: ['report.card.nav'],
                    props: {
                        activeClassName: 'active'
                    },
                    multi: [{
                        routeName: 'ut-report:report',
                        routeParams: {name: 'SMSAlerts'},
                        title: 'SMS Alerts',
                        permission: ['card.report.listOfCards'],
                        props: {
                            activeClassName: 'active'
                        }
                    }]
                },
                {
                    routeName: 'ut-report:report:transfer',
                    title: 'Transaction Reports',
                    permission: ['report.transfer.nav'],
                    props: {
                        activeClassName: 'active'
                    },
                    multi: [{
                        routeName: 'ut-report:report',
                        routeParams: {name: 'TransferReport'},
                        title: 'Transactions List',
                        permission: ['db/transfer.report.transfer'],
                        props: {
                            activeClassName: 'active'
                        }
                    }, {
                        routeName: 'ut-report:report',
                        routeParams: {name: 'TransferTypeStatistics'},
                        title: 'Transaction Type Statistics',
                        permission: ['db/transfer.report.byTypeOfTransfer'],
                        props: {
                            activeClassName: 'active'
                        }
                    }, {
                        routeName: 'ut-report:report',
                        routeParams: {name: 'TransferHourOfDay'},
                        title: 'Transaction - Hour of Day Statistics',
                        permission: ['db/transfer.report.byHourOfDay'],
                        props: {
                            activeClassName: 'active'
                        }
                    }, {
                        routeName: 'ut-report:report',
                        routeParams: {name: 'TransferDayOfWeek'},
                        title: 'Transactions - Day of Week Statistics',
                        permission: ['db/transfer.report.byDayOfWeek'],
                        props: {
                            activeClassName: 'active'
                        }
                    }, {
                        routeName: 'ut-report:report',
                        routeParams: {name: 'TransferWeekOfYear'},
                        title: 'Transactions - Week of Year Statistics',
                        permission: ['db/transfer.report.byWeekofYear'],
                        props: {
                            activeClassName: 'active'
                        }
                    }, {
                        routeName: 'ut-report:report',
                        routeParams: {name: 'SettlementReport'},
                        title: 'Settlement Report',
                        permission: ['db/transfer.report.settlement'],
                        props: {
                            activeClassName: 'active'
                        }
                    }, {
                        routeName: 'ut-report:report',
                        routeParams: {name: 'SettlementDetails'},
                        title: 'Settlement Details',
                        permission: ['db/transfer.report.settlementDetails'],
                        props: {
                            activeClassName: 'active'
                        }
                    }]
                }, {
                    routeName: 'ut-report:report:atm',
                    title: 'ATM',
                    permission: ['report.atm.nav'],
                    props: {
                        activeClassName: 'active'
                    },
                    multi: [
                        {
                            routeName: 'ut-report:report',
                            routeParams: {name: 'CashPosition'},
                            title: 'Cash Position',
                            permission: ['db/atm.cashPosition'],
                            props: {
                                activeClassName: 'active'
                            }
                        }
                    ]
                }]
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
    getDocsUrl: PropTypes.func,
    mainUrl: PropTypes.string,
    mainTabset: PropTypes.array,
    cards: PropTypes.object
};

Provider.propTypes = {
    children: PropTypes.node
};
