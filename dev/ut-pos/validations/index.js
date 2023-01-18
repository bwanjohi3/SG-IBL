'use strict';

module.exports = {
    'terminal.add': require('./terminal/add'),
    'terminal.edit': require('./terminal/edit'),
    'terminal.fetch': require('./terminal/fetch'),
    'terminal.get': require('./terminal/get'),
    'terminal.info': require('./terminal/info'),
    'organization.list': require('./terminal/organization'),
    'parameter.list': require('./terminal/parameter'),
    'brandModel.list': require('./brandModel/list'),
    'brandModel.add': require('./brandModel/add'),
    'brandModel.get': require('./brandModel/get'),
    'brandModel.edit': require('./brandModel/edit'),
    'application.fetch': require('./application/fetch'),
    'application.list': require('./application/list'),
    'application.add': require('./application/add'),
    'application.get': require('./application/get'),
    'application.edit': require('./application/edit'),
    'binList.fetch': require('./binList/fetch'),
    'binList.add': require('./binList/add'),
    'binList.get': require('./binList/get'),
    'binList.edit': require('./binList/edit'),
    'keyChain.list': require('./terminal/keys')
};
