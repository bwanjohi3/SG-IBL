import React from 'react';
import {Route, IndexRoute} from 'react-router';
import {getRoute} from 'ut-front/react/routerHelper';
import registerRoutes from './registerRoutes';
import {Home, Main, Terminal, Application, BinList} from './pages';

export const mainRoute = registerRoutes();

export const UtPosRoutes = () => {
    return (
        <Route component={Main}>
            <Route path={getRoute('ut-pos:home')}>
                <IndexRoute component={Home} />
                <Route path={getRoute('ut-pos')}>
                    <Route path={getRoute('ut-pos:terminal')} component={Terminal} />
                    <Route path={getRoute('ut-pos:application')} component={Application} />
                    <Route path={getRoute('ut-pos:binList')} component={BinList} />
                </Route>
            </Route>
        </Route>
    );
};
