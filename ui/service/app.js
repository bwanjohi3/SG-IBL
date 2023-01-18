import React from 'react';
import {Route} from 'react-router';
import ReactDOM from 'react-dom';
import {UtFront} from 'ut-front/react';
import initApp from 'ut-front-react/initApp';
import MaterialUILayout from 'ut-front-react/components/MaterialUILayout';
import { LOGOUT } from 'ut-front-react/containers/LoginForm/actionTypes';
import extLayout from './Pages/Layout';
import Dashboard from './Pages/Dashboard';
import favicon from 'ut-front-react/assets/images/favicon.ico';
import {UtCoreRoutes} from 'ut-core/ui/react';
import {UtUserRoutes} from 'ut-user/ui/react';
import {UtCardRoutes} from 'ut-card/ui/react';
import {UtRuleRoutes} from 'ut-rule/ui/react';
import {UtCustomerRoutes} from 'ut-customer/ui/react';
import {UtLedgerRoutes} from 'ut-ledger/ui/react';
import {UtBulkRoutes} from 'ut-bulk-payment/ui/react';
import {UtAuditRoutes} from 'ut-audit/ui/react';
import {UtHistoryRoutes} from 'ut-audit/modules/history/ui/react';
import UtCoreReducers from 'ut-core/ui/react/reducers';
import UtUserReducers from 'ut-user/ui/react/reducers';
import UtCardReducers from 'ut-card/ui/react/reducers';
import UtRuleReducers from 'ut-rule/ui/react/reducers';
import UtCustomerReducers from 'ut-customer/ui/react/reducers';
import UtLedgerReducers from 'ut-ledger/ui/react/reducers';
import UtBulkReducers from 'ut-bulk-payment/ui/react/reducers';
import UtAuditReducers from 'ut-audit/ui/react/reducers';
import UtHistoryReducers from 'ut-audit/modules/history/ui/react/reducers';
import UTFrontReactReducers from 'ut-front-react/reducers';
import {getRoute} from 'ut-front/react/routerHelper';
import {AppContainer} from 'react-hot-loader';
import ConfigProvider from './configProvider';
import Provider from './provider';

module.exports = {
    init(bus) {
        this.bus = bus;
        var headHTML = document.getElementsByTagName('head')[0].innerHTML +
                        '<link type="text/css" rel="stylesheet" href="/s/user/react/index.css">' +
                        `<link href="${favicon}" rel="icon" type="image/x-icon" />`;
        document.getElementsByTagName('head')[0].innerHTML = headHTML;
        document.title = 'Self-Service';
    },
    load() {
        var routes = (
            <Route component={ConfigProvider}>
                {UtUserRoutes()}
                {UtCoreRoutes()}
                {UtCardRoutes()}
                {UtRuleRoutes(this.bus.config['ut-rule'])}
                {UtCustomerRoutes()}
                {UtLedgerRoutes()}
                {UtBulkRoutes()}
                {UtAuditRoutes()}
                {UtHistoryRoutes()}
                <Route path={getRoute('ut-impl:dashboard')} component={Dashboard} />
            </Route>
        );
        var render = (app) => ReactDOM.render(
            <AppContainer>
                <Provider>
                    <MaterialUILayout>
                        <UtFront
                          reducers={{...UTFrontReactReducers, ...UtUserReducers, ...UtCoreReducers, ...UtCardReducers, ...UtRuleReducers, ...UtCustomerReducers, ...UtLedgerReducers, ...UtBulkReducers, ...UtAuditReducers, ...UtHistoryReducers}}
                          utBus={this.bus}
                          resetAction={LOGOUT}
                          environment={!this.bus.config || !this.bus.config.debug ? 'production' : ''}>
                              {app}
                          </UtFront>
                    </MaterialUILayout>
                </Provider>
            </AppContainer>,
            document.getElementById('utApp')
        );
        render(initApp({routes: routes, extLayout}));
        if (module.hot) {
            module.hot.accept('ut-front-react/initApp', () => {
                render(require('ut-front-react/initApp').default({routes: routes, extLayout}));
            });
        }
    }
};
