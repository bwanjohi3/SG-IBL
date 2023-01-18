import React from 'react';
import {Route, IndexRoute} from 'react-router';
import {getRoute} from 'ut-front/react/routerHelper';
import registerRoutes from './registerRoutes';
import {Home, Main, Terminal} from './pages';

export const mainRoute = registerRoutes();

export const UtCTPRoutes = () => {
    return (
        <Route component={Main}>
            <Route path={getRoute('ut-ctp:home')}>
                <IndexRoute component={Home} />
                <Route path={getRoute('ut-ctp:atm')}>
                    <Route path={getRoute('ut-ctp:atm:terminal')} component={Terminal} />
                </Route>
            </Route>
        </Route>
    );
};
