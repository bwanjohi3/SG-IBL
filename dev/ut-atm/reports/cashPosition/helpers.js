var {evalResult, formatNumber} = require('ut-report/assets/script/common');

module.exports = {
    staticResources: [
        {rel: 'stylesheet', type: 'text/css', href: '/s/ut-atm/repository/css/reportStyle.css'}
    ],
    transformCellValue: function({allowHtml, nodeContext, dateFormat, locale}) {
        return (value, field, data, isHeader) => {
            let classnames = [];
            switch (field.name) {
                case 'terminalId':
                case 'terminalName':
                case 'cassette1Currency':
                case 'cassette2Currency':
                case 'cassette3Currency':
                case 'cassette4Currency':
                    break;
                default:
                    if (!isHeader) {
                        classnames.push('textColorBlue');
                        value = formatNumber(value);
                    }
                    classnames.push('rightAlign');
                    break;
            }
            if (allowHtml) {
                return evalResult(value, 'div', classnames, nodeContext);
            }

            return value;
        };
    }
};
