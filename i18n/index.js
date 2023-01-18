var fs = require('fs');
var run = require('ut-run').runParams;
var PO = require('pofile');
var path = require('path');

var server = {
    main: null,
    config: null,
    app: '../server',
    env: 'test',
    method: 'debug'
};

run(server, module.parent).then((server) => {
    var itemNameTranslationUpload = server.bus.importMethod('core.itemNameTranslation.upload');
    var languageFetch = server.bus.importMethod('core.language.fetch');
    var files = fs.readdirSync(path.join(__dirname, 'translations'));
    var calls = 0;
    files.map((file) => {
        var iso2Code = file.split('.')[0];
        languageFetch({
            iso2Code: iso2Code
        }).then((language) => {
            PO.load(path.join(__dirname, 'translations', file), function(err, po) {
                if (err) throw err;
                var items = po.items.reduce((newItems, item) => {
                    newItems.push({
                        itemName: item.msgid,
                        itemNameTranslation: item.msgstr[0]
                    });
                    return newItems;
                }, []);
                itemNameTranslationUpload({
                    languageId: language[0][0].languageId,
                    itemNameTranslationTT: items
                }).then(() => {
                    if (++calls === files.length) {
                        server.ports.forEach((port) => {
                            port.stop();
                        });
                        server.bus.destroy();
                        server.master.destroy();
                    }
                }).catch((e) => {
                    throw e;
                });
            });
        }).catch((e) => {
            throw e;
        });
    });
});
