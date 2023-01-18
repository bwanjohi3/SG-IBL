import React from 'react';
import {Route, IndexRoute} from 'react-router';
import { getRoute } from 'ut-front/react/routerHelper';
import registerRoutes from './registerRoutes';
import { Home, Main, Application, Cards, CardInUse, Batches, CardProduct, CardType, CardReason, CardBin, PINMailerFormat, PinMailerFile } from './pages';

export const mainRoute = registerRoutes();

export const UtCardRoutes = () => {
    return (
        <Route component={Main}>
            <Route path={getRoute('ut-card:home')}>
                <IndexRoute component={Home} />
                <Route path={getRoute('ut-card:application')} component={Application} />
                <Route path={getRoute('ut-card:batch')} component={Batches} />
                <Route path={getRoute('ut-card:cards')} component={Cards} />
                <Route path={getRoute('ut-card:cardInUse')} component={CardInUse} />
                <Route path={getRoute('ut-card:cardProduct')} component={CardProduct} />
                <Route path={getRoute('ut-card:cardType')} component={CardType} />
                <Route path={getRoute('ut-card:cardReason')} component={CardReason} />
                <Route path={getRoute('ut-card:cardBin')} component={CardBin} />
                <Route path={getRoute('ut-card:pinMailerFormat')} component={PINMailerFormat} />
		        <Route path={getRoute('ut-card:pinMailerFile')} component={PinMailerFile} />
            </Route>
        </Route>
    );
};
