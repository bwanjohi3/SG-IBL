var path = require('path');
const fs = require('fs');
function firstRow(result) {
    return result && result[0] && result[0][0];
}

module.exports = {
    schema: [{path: path.join(__dirname, 'schema'), linkSP: true}],
    "application.add.request.send": function (msg, $meta) {

        let uploadPath = this.bus.config.workDir + "\\uploads\\";
        msg.application[0].firmwarePath = uploadPath + msg.application[0].attachment.filename;

        if (fs.existsSync(uploadPath +msg.application[0].attachment.filename)) {
            return msg;
        } else {
            throw new Error('Firmware not uploaded');
        }
        
        return msg;
    },
    'terminal.fwinfo.response.receive': firstRow
};
