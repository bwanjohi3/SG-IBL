// var csv = require('fast-csv');
// var fs = require('fs');
// var path = 'D:/Projects/UT5.3/shared_folder';

module.exports = {
    id: 'cron',
    receive: (msg, $meta) => {
        $meta.mtid = 'discard';
        return msg;
        /* switch ($meta.opcode) {
            case 'test':
                var stream = fs.createReadStream(path + '/ACCOUNT_SN_201609121476195039.csv');
                //fs.createReadStream(path + '/ACCOUNT_SN_201609121476195039.csv');
                csv.fromStream(stream)
                .on('data', function(data) {
                    console.log(data);
                })
                .on('end', function() {
                    console.log('done');
                }) */
        // }
    }
};
