import { registerRoute } from 'ut-front/react/routerHelper';

export default () => {
    let mainRoute = 'ut-ctp:home';
    registerRoute(mainRoute).path('/ctp');

    registerRoute('ut-ctp:atm').path('atm').parent(mainRoute);
    registerRoute('ut-ctp:atm:terminal').path('terminal').parent('ut-ctp:atm');
    return mainRoute;
};
