var path = require('path');
module.exports = {
    schema: [
        {path: path.join(__dirname, 'schema'), linkSP: true},
        ({config: {testATM}}) => testATM && {path: path.join(__dirname, 'schema/testATM')},
        ({config: {testRule}}) => testRule && {path: path.join(__dirname, 'schema/testRule')}
    ]
};
