import { registerRoute } from 'ut-front/react/routerHelper';

export default () => {
    let mainRoute = 'ut-card:home';
    registerRoute(mainRoute).path('/card');

    registerRoute('ut-card:application').path('application').parent(mainRoute);
    registerRoute('ut-card:batch').path('batch').parent(mainRoute);
    registerRoute('ut-card:cards').path('card').parent(mainRoute);
    registerRoute('ut-card:cardInUse').path('distributed').parent(mainRoute);
    registerRoute('ut-card:cardProduct').path('administration/cardProduct').parent(mainRoute);
    registerRoute('ut-card:cardType').path('administration/cardType').parent(mainRoute);
    registerRoute('ut-card:cardReason').path('administration/cardReason').parent(mainRoute);
    registerRoute('ut-card:cardBin').path('administration/cardBin').parent(mainRoute);
    registerRoute('ut-card:pinMailerFormat').path('administration/pinMailerFormat').parent(mainRoute);
	registerRoute('ut-card:pinMailerFile').path('administration/pinMailerFile').parent(mainRoute);
    return mainRoute;
};
