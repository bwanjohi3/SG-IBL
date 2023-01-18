import React from 'react';
import {Route} from 'react-router';
import ReactDOM from 'react-dom';
import {UtFront} from 'ut-front/react';
import initApp from 'ut-front-react/initApp';
import MaterialUILayout from 'ut-front-react/components/MaterialUILayout';
import { LOGOUT } from 'ut-front-react/containers/LoginForm/actionTypes';
import extLayout from './Pages/Layout';
import Dashboard from './Pages/Dashboard';

import {UtAMLRoutes} from 'ut-aml/ui/react';
import {UtCoreRoutes} from 'ut-core/ui/react';
import {UtUserRoutes} from 'ut-user/ui/react';
import {UtCardRoutes} from 'ut-card/ui/react';
import {UtLedgerRoutes} from 'ut-ledger/ui/react';
import {UtCustomerRoutes} from 'ut-customer/ui/react/admin';
import {UtRuleRoutes} from 'ut-rule/ui/react';
import {UtTransferRoutes} from 'ut-transfer/ui/react';
import {UtReportRoutes} from 'ut-report/ui/react';
import {UtAuditRoutes} from 'ut-audit/ui/react';
import {UtHistoryRoutes} from 'ut-audit/modules/history/ui/react';
import {UtMirrorsRoutes} from 'ut-mirrors/ui/react';
import {UtAgentRoutes} from 'ut-agent/ui/react';
import {UtCTPRoutes} from 'ut-atm/ui/react';
import {UtPosRoutes} from 'ut-pos/ui/react';

import UtAMLReducers from 'ut-aml/ui/react/reducers';
import UtCoreReducers from 'ut-core/ui/react/reducers';
import UtUserReducers from 'ut-user/ui/react/reducers';
import UtCardReducers from 'ut-card/ui/react/reducers';
import UtLedgerReducers from 'ut-ledger/ui/react/reducers';
import UtCustomerReducers from 'ut-customer/ui/react/adminReducers';
import UtRuleReducers from 'ut-rule/ui/react/reducers';
import UtTransferReducers from 'ut-transfer/ui/react/reducers';
import UtReportReducers from 'ut-report/ui/react/reducers';
import UtAuditReducers from 'ut-audit/ui/react/reducers';
import UtHistoryReducers from 'ut-audit/modules/history/ui/react/reducers';
import UTFrontReactReducers from 'ut-front-react/reducers';
import UtMirrorsReducers from 'ut-mirrors/ui/react/reducers';
import UtAgentReducers from 'ut-agent/ui/react/reducers';
import UTCTPReducers from 'ut-atm/ui/react/reducers';
import UTPosReducers from 'ut-pos/ui/react/reducers';

import favicon from 'ut-front-react/assets/images/favicon.ico';
import {getRoute} from 'ut-front/react/routerHelper';
import {AppContainer} from 'react-hot-loader';
import Provider from './provider';
import ConfigProvider from './configProvider';
import { helpers as reportHelpers } from './config/report/helpers';
import BusinessUnits from 'ut-customer/ui/react/containers/BusinessUnits';
import {initMirrors} from './init';
module.exports = {
    init(bus) {
        this.bus = bus;
        var headHTML = document.getElementsByTagName('head')[0].innerHTML +
                        '<link type="text/css" rel="stylesheet" href="/s/user/react/index.css">' +
                        `<link href="${favicon}" rel="icon" type="image/x-icon" />`;
        document.getElementsByTagName('head')[0].innerHTML = headHTML;
        document.title = 'Standard';
        initMirrors();
    },
    load() {
        var routes = (
            <Route component={ConfigProvider}>
                {UtUserRoutes({ components: { BusinessUnits } })}
                {UtCoreRoutes({ components: { BusinessUnits } })}
                {UtCardRoutes()}
                {UtCustomerRoutes()}
                {UtRuleRoutes(this.bus.config['ut-rule'])}
                {UtTransferRoutes()}
                {UtReportRoutes(reportHelpers)}
                {UtMirrorsRoutes()}
                {UtAgentRoutes({ components: { BusinessUnits } })}
                {UtLedgerRoutes({ components: { BusinessUnits } })}
                {UtAuditRoutes()}
                {UtHistoryRoutes()}
                {UtCTPRoutes()}
                {UtPosRoutes()}
                {UtAMLRoutes()}
                <Route path={getRoute('ut-impl:dashboard')} component={Dashboard} />
            </Route>
        );
        var render = (app) => ReactDOM.render(
            <AppContainer>
                <Provider>
                    <MaterialUILayout>
                        <UtFront
                          reducers={{
                              ...UTFrontReactReducers,
                              ...UtUserReducers,
                              ...UtAgentReducers,
                              ...UtCoreReducers,
                              ...UtCardReducers,
                              ...UtLedgerReducers,
                              ...UtCustomerReducers,
                              ...UtRuleReducers,
                              ...UtTransferReducers,
                              ...UtReportReducers,
                              ...UtMirrorsReducers,
                              ...UtLedgerReducers,
                              ...UtAuditReducers,
                              ...UtHistoryReducers,
                              ...UTCTPReducers,
                              ...UTPosReducers,
                              ...UtAMLReducers}}
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
