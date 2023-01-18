var {evalResult, formatDate} = require('ut-report/assets/script/common');

module.exports = {
    transformCellValue: function({dateFormat, locale, allowHtml, nodeContext}) {
        return (value, field, data, isHeader) => {
            var classNames = [];
            var result = value;

            switch (field.name) {
                case 'createdOn':
                case 'activatedOn':
                case 'expirationDate':
                case 'destructedOn':
                    if (!isHeader) {
                        if (value) {
                            result = formatDate(value, dateFormat, locale);
                        }
                    }
                    break;
            }
            if (allowHtml) {
                return evalResult(result, 'div', classNames, nodeContext);
            }

            return result;
        };
    }
};
