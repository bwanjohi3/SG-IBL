module.exports = ({config}) => [{
    ports: [],
    modules: {},
    validations: {}
},
    require('../../ports/bioMock')(config.bio)
];
