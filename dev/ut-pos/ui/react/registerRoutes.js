import { registerRoute } from 'ut-front/react/routerHelper';

export default () => {
    let mainRoute = 'ut-pos:home';
    registerRoute(mainRoute).path('/pos');

    registerRoute('ut-pos').path('pos').parent(mainRoute);
    registerRoute('ut-pos:terminal').path('terminal').parent('ut-pos');
    registerRoute('ut-pos:application').path('application').parent('ut-pos');
    registerRoute('ut-pos:binList').path('binList').parent('ut-pos');

    return mainRoute;
};
