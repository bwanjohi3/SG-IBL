import {getLink} from 'ut-front/react/routerHelper';

const getStrippedLink = (route) => {
    var link = getLink(route);
    var index = link.indexOf('/:');
    link = link.substr(0, index);

    return link;
};

const mapping = {
    '_notFoundRoute': '/docs/AccessingtheSystem.html',
    '/': '/docs/UserInterface.html',
    [getLink('ut-user:userProfile')]: '/docs/ManagingUserProfile.html',
    [getLink('ut-user:home')]: '/docs/UserInterface.html',
    // Content
    [getLink('ut-core:items')]: '/docs/ContentItemsTranslations.html',
    [getLink('ut-core:itemCreate')]: '/docs/ContentItemsTranslations.html',
    [getStrippedLink('ut-core:itemEdit')]: '/docs/ContentItemsTranslations.html',
    // Units
    [getLink('ut-user:businessUnits')]: '/docs/BusinessUnitsManagement.html',
    [getLink('ut-user:businessUnitsCreate')]: '/docs/BusinessUnitsManagement.html',
    [getStrippedLink('ut-user:businessUnitsEdit')]: '/docs/BusinessUnitsManagement.html',
    // Network
    [getLink('ut-agent:networks')]: '/docs/AgencyMerchantNetworks.html',
    [getLink('ut-agent:networkCreate')]: '/docs/AgencyMerchantNetworks.html',
    [getStrippedLink('ut-agent:networkEdit')]: '/docs/AgencyMerchantNetworks.html',
    [getStrippedLink('ut-agent:networkApprove')]: '/docs/AgencyMerchantNetworks.html',
    // Users
    [getLink('ut-user:users')]: '/docs/UsersManagement.html',
    [getLink('ut-user:userCreate')]: '/docs/UsersManagement.html',
    [getStrippedLink('ut-user:userEdit')]: '/docs/UsersManagement.html',
    [getStrippedLink('ut-user:userValidate')]: '/docs/UsersManagement.html',
    // Roles
    [getLink('ut-user:roles')]: '/docs/RolesPermissionsManagement.html',
    [getLink('ut-user:roleCreate')]: '/docs/RolesPermissionsManagement.html',
    [getStrippedLink('ut-user:roleEdit')]: '/docs/RolesPermissionsManagement.html',
    [getLink('ut-user:accesspermissions')]: '/docs/PermissionsBulkManagement.html',
    // Access
    [getLink('ut-user:access')]: '/docs/AccessPoliciesManagement.html',
    [getLink('ut-user:accesspolicy')]: '/docs/AccessPoliciesManagement.html',
    [getLink('ut-user:accesspolicyCreate')]: '/docs/AccessPoliciesManagement.html',
    [getStrippedLink('ut-user:accesspolicyEdit')]: '/docs/AccessPoliciesManagement.html',
    // System
    [getLink(('ut-user:systemerrormessages'))]: '/docs/ErrorMessages.html',
    [getLink('ut-user:systemexternalsystems')]: '/docs/ExternalSystemIntegrations.html',
    [getStrippedLink('ut-user:createExternalSystemConfig')]: '/docs/ExternalSystemIntegrations.html',
    [getStrippedLink('ut-user:editExternalSystemConfig')]: '/docs/ExternalSystemIntegrations.html',
    [getLink('ut-system:systemexternalsystemcredentials')]: '/docs/ExternalSystemCredentials.html',
    [getLink('ut-transfer:partners')]: '/docs/TransferPartnersandCardIssuers.html',
    // Reports
    [getLink('ut-report:reports')]: '/docs/AccessingtheSystem.html',
    [getLink('ut-report:report')]: '/docs/AccessingtheSystem.html',
    [getLink('ut-report:report:transfer')]: '/docs/AccessingtheSystem.html', // to be added
    // Mirrors
    // [getLink('ut-mirrors:reports')]: '/docs/Reports.html',
    // Rules
    [getLink('ut-rule:home')]: '/docs/RulesManagement.html',
    [getLink('ut-customer:kyc')]: '/docs/KYCConfiguration.html',
    [getStrippedLink('ut-customer:kycCreate')]: '/docs/KYCConfiguration.html',
    [getStrippedLink('ut-customer:kycEdit')]: '/docs/KYCConfiguration.html',
    [getLink('ut-rule:home')]: '/docs/FeesCommissionsandLimitsFCL.html',
    // ledger
    [getLink('ut-ledger:products')]: '/docs/ProductCatalog.html',
    [getStrippedLink('ut-ledger:productEdit')]: '/docs/ProductCatalog.html',
    [getStrippedLink('ut-ledger:productValidate')]: '/docs/ProductCatalog.html',
    [getLink('ut-ledger:productCreate')]: '/docs/ProductCatalog.html',
    [getLink('ut-ledger:accounts')]: '/docs/InternalAccounts.html',
    [getLink('ut-ledger:accountCreate')]: '/docs/InternalAccounts.html',
    [getStrippedLink('ut-ledger:accountEdit')]: '/docs/InternalAccounts.html',
    [getStrippedLink('ut-ledger:accountApprove')]: '/docs/InternalAccounts.html',
    // Cards
    [getLink('ut-card:home')]: '/docs/Cards.html',
    [getLink('ut-card:batch')]: '/docs/AccessingtheSystem.html',
    [getLink('ut-card:cards')]: '/docs/AccessingtheSystem.html',
    [getLink('ut-card:application')]: '/docs/AccessingtheSystem.html',
    [getLink('ut-card:cardInUse')]: '/docs/AccessingtheSystem.html',
    [getLink('ut-card:administration')]: '/docs/CardsAdministration.html',
    [getLink('ut-card:cardProduct')]: '/docs/CardProducts.html',
    [getLink('ut-card:cardReason')]: '/docs/CardReasons.html',
    [getLink('ut-card:cardBin')]: '/docs/CardBINs.html',
    // Risk & Fraud
    [getLink('ut-audit:auditActionConfiguration')]: '/docs/AuditLogConfiguration.html',
    [getLink('ut-audit:auditLogReport')]: '/docs/AccessingtheSystem.html'
};

export const getDocsUrl = (location) => {
    const specialWords = ['edit', 'validate', 'approve', 'create'];
    specialWords.forEach(word => {
        if (location.indexOf(`/${word}/`) > -1) {
            let index = location.indexOf(`/${word}/`);
            location = location.substr(0, index + `/${word}`.length);
        }
    });

    return mapping[location] || mapping._notFoundRoute;
};
