/* global URL,Blob,FormData,jQuery,Spinner,log4javascript,btoa,config */

function pendingAuthorization(closeCode) {
    if (closeCode === 401 || closeCode === 403) {
        if (config.ssoAuthUrl) {
            setTimeout(() => {
                var location = `${config.ssoAuthUrl}${btoa(window.location.href)}`;
                if (!jQuery('#loginInfo').length) {
                    jQuery('body').append(jQuery('<div/>').attr('id', 'loginInfo').attr('title', closeCode).css({position: 'absolute', top: '50%', left: '50%', 'z-index': 10, background: '#ccc', padding: '10px', 'text-align': 'center'}).append('<span>Not Logged in</span>').append('<br />').append(jQuery('<a>click here to login</a>').attr('href', location)));
                }
            }, 2000);
            return true;
        }
    }
};
jQuery(document).ready(function() {
    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    // @@@@@@@@  Spinner start  @@@@@@@@
    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

    var spinnerTarget = document.getElementById('spinner');
    var spinner = new Spinner({
        lines: 8, // The number of lines to draw
        length: 0, // The length of each line
        width: 3, // The line thickness
        radius: 8, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 90, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: 'red', // #rgb or #rrggbb or array of colors
        speed: 0.7, // Rounds per second
        trail: 50, // Afterglow percentage
        shadow: true, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '50%', // Top position relative to parent
        left: '50%' // Left position relative to parent
    });
    function spinStart() {
        spinnerTarget.style.display = 'block';
        spinner.spin(spinnerTarget);
    }

    function spinStop() {
        spinnerTarget.style.display = 'none';
        spinner.stop();
    }

    var autoSpinTimeout = null;
    function autoSpin() {
        if (!autoSpinTimeout) {
            spinStart();
        } else {
            clearTimeout(autoSpinTimeout);
        }
        autoSpinTimeout = setTimeout(function() {
            autoSpinTimeout = null;
            spinStop();
        }, 500);
    }
    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    // @@@@@@@@   Spinner end   @@@@@@@@
    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

    var pageWrapper = document.getElementById('logger');
    function wsInit() {
        var xsrfToken = '';
        if (typeof (config) !== 'undefined' && config && config.xsrfToken) {
            xsrfToken = config.xsrfToken;
        }

        var ws = new window.WebSocket('ws://' + window.location.host + '/status?xsrf=' + xsrfToken);
        ws.onopen = function(e) {
            console.log('connected');
            ws.send('test');
            pageWrapper.style.borderTop = 'none';
        };
        ws.onclose = function(event) {
            pageWrapper.style.borderTop = '5px solid red';
            setTimeout(wsInit, 2000);
            if (pendingAuthorization(event && event.code && (event.code - 4000))) {
                return;
            }
        };

        ws.onmessage = function(e) {
            var data = JSON.parse(e.data);
            var msg = data.msg;

            switch (data.type) {
                case 'logJSON':
                    if (!msg) {
                        return;
                    }
                    autoSpin();
                    log[LEVELS[msg.level]](msg);
                    break;
                case 'spinStart':
                    spinStart();
                    break;
                case 'spinStop':
                    spinStop();
                    break;
            }
        };
    };
    wsInit();

    var LEVELS = {};
    LEVELS['10'] = LEVELS['trace'] = 'trace';
    LEVELS['20'] = LEVELS['debug'] = 'debug';
    LEVELS['30'] = LEVELS['info'] = 'info';
    LEVELS['40'] = LEVELS['warn'] = 'warn';
    LEVELS['50'] = LEVELS['error'] = 'error';
    LEVELS['60'] = LEVELS['fatal'] = 'fatal';

    var log = log4javascript.getLogger('main');
    log.setLevel(log4javascript.Level.TRACE);
    var appender = new log4javascript.InPageAppender('logger', false, false, true, '100%', '100%');
    appender.setMaxMessages(5000);
    var layout = new log4javascript.JsonLayout();
    appender.setLayout(layout);
    var consoleWin = null;
    appender.addEventListener('load', function() {
        consoleWin = appender.getConsoleWindow();
        var jss = consoleWin.parent.jss.forDocument(consoleWin.document);
        function setSearchMarkers(content) {
            var regexp = new RegExp('(' + consoleWin.currentSearch.searchTerm + ')', 'gi');
            for (var prop in content) {
                if (content.hasOwnProperty(prop) && typeof content[prop] === 'string') {
                    content[prop] = content[prop].replace(regexp, '<span class=\'searchterm\'>$1</span>');
                }
            }
            return content;
        }
        function hex2ascii(hex) {
            var str = '';
            for (var i = 0; i < hex.length; i += 2) {
                var code = parseInt(hex.substr(i, 2), 16);
                if (code === 9) { code = 8594; } else
                if (code === 10) { code = 8595; } else
                if (code === 13) { code = 8629; } else
                if (code === 15) { code = 9788; } else
                if (code === 27) { code = 8592; } else
                if (code === 28) { code = 8286; } else
                if (code < 32) { code = 32; }
                str += String.fromCharCode(code);
            }
            if (str.length < 32) {
                str = (str + ' '.repeat(32)).substr(0, 32);
            }
            return str;
        }
        var escapeXmlMap = {'>': '&gt;', '<': '&lt;', '\'': '&apos;', '"': '&quot;', '&': '&amp;'};
        var escapeXmlRegExp = /([&"<>'])/g;
        function escapeXml(str) {
            return str.replace(escapeXmlRegExp, function(str, symbol) {
                return escapeXmlMap[symbol];
            });
        }
        consoleWin.LogEntryElementContainer.prototype.setContent = function(content, wrappedContent) {
            var searched = consoleWin.currentSearch && (content !== this.logEntry.formattedMessage);
            if (typeof content !== 'object') {
                content = JSON.parse(this.logEntry.formattedMessage);
            }
            // var message = JSON.parse(content.message.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t'));
            var time = content.timestamp ? new Date(content.timestamp) : new Date();
            content.time = '' + time.getFullYear() +
            '-' + ('00' + (time.getMonth() + 1)).substr(-2) +
            '-' + ('00' + time.getDate()).substr(-2) +
            ' ' + ('00' + time.getHours()).substr(-2) +
            ':' + ('00' + time.getMinutes()).substr(-2) +
            ':' + ('00' + time.getSeconds()).substr(-2);
            content.sender = '';
            content.context = '';
            content.opcode = '';
            content.mtid = '';
            if (content.message) {
                if (content.message.name) {
                    content.sender = content.message.name;
                }
                if (content.message.context) {
                    content.context = content.message.context;
                }
                if (content.message.$meta) {
                    content.opcode = content.message.$meta.method || content.message.$meta.opcode || '';
                    if (content.message.$meta.mtid) {
                        content.mtid = content.message.$meta.mtid;
                    }
                }
                if (!content.mtid) {
                    if (content.message.mtid) {
                        content.mtid = content.message.mtid;
                    } else if (Array.isArray(content.message.message) && content.message.message.length) {
                        content.mtid = content.message.message.pop().mtid || '';
                    }
                }
            }
            if (content.mtid === 'frame') {
                try {
                    var lines = [];
                    var asciiLines = [];
                    var hex = content.message.message;
                    if (typeof hex === 'string') {
                        var ascii = hex2ascii(hex);
                        for (var i = 0; i < hex.length; i += 64) {
                            lines.push(hex.substr(i, 64));
                            asciiLines.push(ascii.substr(i / 2, 32));
                        }
                    } else {
                        lines.push(JSON.stringify(hex, null, '  '));
                    }
                    content.message = '<span style="display: inline-block;" ondblclick="if (this.parentElement.className !==\'details\') {this.parentElement.className=\'details\'} else {this.parentElement.className=\'\'}">' +
                        asciiLines.join('\r\n') +
                        '</span><span style="display: inline-block; padding-left:10px" ondblclick="if (this.parentElement.className !==\'details\') {this.parentElement.className=\'details\'} else {this.parentElement.className=\'\'}">' +
                        escapeXml(lines.join('\r\n')) +
                        '</span>';
                } catch (e) {
                    console.error(e);
                }
            } else {
                if (typeof content.message !== 'string') {
                    try {
                        content.message = '<span ondblclick="if (this.parentElement.className !==\'details\') {this.parentElement.className=\'details\'} else {this.parentElement.className=\'\'}">' +
                            escapeXml(JSON.stringify(content.message, null, 2)) +
                            '</span>';
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    content.message = escapeXml(content.message);
                }
            }
            if (searched) {
                content = setSearchMarkers(content);
            }
            var detailsDiv = this.mainDiv.lastChild && this.mainDiv.lastChild.lastChild;
            this.mainDiv.innerHTML = '';
            var element;
            element = document.createElement('td');
            element.style.whiteSpace = 'nowrap';
            this.mainDiv.appendChild(element).innerHTML = content.time;
            this.mainDiv.appendChild(document.createElement('td')).innerHTML = content.level;
            this.mainDiv.appendChild(document.createElement('td')).innerHTML = content.sender;
            this.mainDiv.appendChild(document.createElement('td')).innerHTML = content.context;
            this.mainDiv.appendChild(document.createElement('td')).innerHTML = content.mtid;
            this.mainDiv.appendChild(document.createElement('td')).innerHTML = content.opcode;
            element = this.mainDiv.appendChild(document.createElement('td'));
            if (detailsDiv) {
                element = element.appendChild(detailsDiv);
            } else {
                element = element.appendChild(document.createElement('div'));
                element.className = 'details';
            }
            element.innerHTML = content.message;
        };

        var exists = {};

        consoleWin.LogEntryMainElementContainer = function(logEntry, containerDomNode) {
            this.logEntry = logEntry;
            this.containerDomNode = containerDomNode;
            this.mainDiv = document.createElement('tr');
            var customClasses = ' ';
            var msg = null;
            var className = null;
            function jssSet(name, value) {
                if (!exists[name]) {
                    jss.set(name, value);
                    exists[name] = true;
                }
            }
            try {
                msg = JSON.parse(logEntry.formattedMessage).message;
                if (msg.name) {
                    className = msg.name.replace(/ /g, '_');
                    customClasses += 'name_' + className + ' ';
                    jssSet('tr.logentry.name_' + className, {'display': 'table-row'});
                    jssSet('div.name_' + className + '#log *.logentry.name_' + className, {'display': 'none'});
                    customToolbars['name'].addOption(className, msg.name);
                }
                if (msg.context) {
                    className = msg.context.replace(/ /g, '_');
                    customClasses += 'context_' + className + ' ';
                    jssSet('tr.logentry.context_' + className, {'display': 'table-row'});
                    jssSet('div.context_' + className + '#log *.logentry.context_' + className, {'display': 'none'});
                    customToolbars['context'].addOption(className, msg.context);
                }
            } catch (e) {
                customClasses = '';
            }
            // customClasses += consoleWin.logEntries.length % 2 ? 'light ' : 'dark ';
            this.mainDiv.className = 'logentry nonielogentry' + customClasses + logEntry.level;
            this.setContent(logEntry.formattedMessage);
        };
        consoleWin.LogEntryMainElementContainer.prototype = new consoleWin.LogEntryElementContainer();

        // @overrides below
        consoleWin.applyFilters = function applyFilters() {
            for (var i = 0; i < consoleWin.logLevels.length; i++) {
                if (consoleWin.getCheckBox(consoleWin.logLevels[i]).checked) {
                    consoleWin.removeClass(consoleWin.logMainContainer, consoleWin.logLevels[i]);
                } else {
                    consoleWin.addClass(consoleWin.logMainContainer, consoleWin.logLevels[i]);
                }
            }
            consoleWin.updateSearchFromFilters();
        };

        consoleWin.toggleAllLevels = function toggleAllLevels() {
            var turnOn = consoleWin.$('switch_ALL').checked;
            for (var i = 0; i < consoleWin.logLevels.length; i++) {
                consoleWin.getCheckBox(consoleWin.logLevels[i]).checked = turnOn;
                if (turnOn) {
                    consoleWin.removeClass(consoleWin.logMainContainer, consoleWin.logLevels[i]);
                } else {
                    consoleWin.addClass(consoleWin.logMainContainer, consoleWin.logLevels[i]);
                }
            }
        };

        consoleWin.clearLog = function clearLog() {
            consoleWin.rootGroup.clear();
            consoleWin.currentGroup = consoleWin.rootGroup;
            consoleWin.logEntries = [];
            consoleWin.logItems = [];
            consoleWin.logEntriesAndSeparators = [];
            consoleWin.doSearch();
            console.log('overridden');
            for (var toolbar in customToolbars) {
                if (customToolbars.hasOwnProperty(toolbar)) {
                    customToolbars[toolbar].clearOptions();
                }
            }
        };
        // @overrides above

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@                 @@@@@@@@
        // @@@@@@@@ custom toolbars @@@@@@@@
        // @@@@@@@@                 @@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

        var switches = jQuery('#switches', consoleWin.document);
        var customToolbars = {};

        // CustomToolbar component
        function CustomToolbar(id) {
            customToolbars[id] = this;
            this.id = id;
            this.options = {};
            this.element = jQuery('<div id="toolbar_' + id + '" class="toolbar"></div>');
            this.labelElement = jQuery('<span>' + (id.charAt(0).toUpperCase() + id.slice(1)) + ' :</span>');
            this.optionsElement = jQuery('<span></span>');
            this.allElement = jQuery('<input type="checkbox" id="' + this.id + '_ALL" checked="checked" title="Show/hide all messages" /><label for="' + this.id + '_ALL" id="' + this.id + '_label_ALL">all</label>');
            var self = this;
            this.allElement.click(function() {
                self.toggleAllOptions();
                self.applyFilters();
            });
            this.element.append([this.labelElement, this.optionsElement, this.allElement]);
            switches.prepend(this.element);
        }

        CustomToolbar.prototype.applyFilters = function() {
            var cssClass = '';
            for (var option in this.options) {
                if (this.options.hasOwnProperty(option)) {
                    cssClass = this.options[option][0].id;
                    this.options[option][0].checked ? consoleWin.removeClass(consoleWin.logMainContainer, cssClass) : consoleWin.addClass(consoleWin.logMainContainer, cssClass);
                }
            }
            consoleWin.updateSearchFromFilters();
        };
        CustomToolbar.prototype.toggleAllOptions = function() {
            var turnOn = this.allElement[0].checked;
            var cssClass = '';
            for (var option in this.options) {
                if (this.options.hasOwnProperty(option)) {
                    this.options[option][0].checked = turnOn;
                    cssClass = this.options[option][0].id;
                    turnOn ? consoleWin.removeClass(consoleWin.logMainContainer, cssClass) : consoleWin.addClass(consoleWin.logMainContainer, cssClass);
                }
            }
        };
        CustomToolbar.prototype.checkAllOptions = function() {
            for (var option in this.options) {
                if (this.options.hasOwnProperty(option)) {
                    if (!this.options[option][0].checked) {
                        this.allElement[0].checked = false;
                        return;
                    }
                }
            }
            this.allElement[0].checked = true;
        };
        CustomToolbar.prototype.addOption = function(id, value) {
            if (this.options[id]) {
                return;
            }
            this.options[id] = jQuery('<input type="checkbox" id="' + this.id + '_' + id + '" checked="checked" title="Show/hide ' + value + ' messages" /><label for="' + this.id + '_' + id + '" id="label_' + this.id + '_' + id + '">' + value + '</label>');
            var self = this;
            this.options[id].click(function() {
                self.applyFilters();
                self.checkAllOptions();
            });
            this.optionsElement.append(this.options[id]);
        };

        CustomToolbar.prototype.clearOptions = function() {
            for (var option in this.options) {
                if (this.options.hasOwnProperty(option)) {
                    consoleWin.removeClass(consoleWin.logMainContainer, this.options[option][0].id);
                    this.options[option].click = null;
                    this.options[option] = null;
                }
            }
            this.options = {};
            this.optionsElement.html('');
            this.checkAllOptions();
        };

        var ctnName = new CustomToolbar('name');
        var ctnCtx = new CustomToolbar('context');
        ctnName === ctnCtx;

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@                 @@@@@@@@
        // @@@@@@@@  Plugins start  @@@@@@@@
        // @@@@@@@@                 @@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

        var optionsBar = jQuery('#options', consoleWin.document);
        var pluginsContainer = jQuery('<span style="margin: 0 10px; padding: 3px 10px; border-left: 1px solid grey; border-right: 1px solid grey"></span>');
        optionsBar.append(pluginsContainer);

        var dateTimePicker = jQuery('#dateTimePicker');

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@   prettify all   @@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        var prettifyContainer = jQuery('<span style="padding: 0 20px 0 0; display: inline-block"></span>');
        var prettifyCheckbox = jQuery('<input type="checkbox" id="prettify_all" title="Prettify" >Prettify</input>');
        pluginsContainer.append(prettifyContainer.append(prettifyCheckbox));
        prettifyCheckbox.click(function(evt) {
            jss.set('div#log table tr td div span', {'white-space': this.checked ? 'pre' : 'inherit'});
        });
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@   file upload   @@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

        var uploadForm = jQuery('<form enctype="multipart/form-data" style="display: inline-block;border-left: 1px solid grey;padding-left: 20px"></form>');
        var uploadFormFile = jQuery('<input name="file" style="width: 150px" type="file" class="button"/>');
        var uploadFormSubmit = jQuery('<input type="button" value="Load" class="button"/>');
        uploadForm.append([uploadFormFile, uploadFormSubmit]);
        pluginsContainer.append(uploadForm);
        var file = null;
        uploadFormFile.change(function(evt) {
            file = this.files[0];
            // maybe add validation
            // var name = file.name;
            // var size = file.size;
            // var type = file.type;
        });
        uploadFormSubmit.click(function(evt) {
            if (!file) { return; }
            var formData = new FormData();
            formData.append('files', file);
            jQuery.ajax({
                url: '/upload-logs',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false
            });
        });

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@  logs querying  @@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        var inputStyle = ' style="padding-left: 3px; font-size: 100%; margin-right: 5px; width: 90px; font-family: tahoma, verdana, arial, helvetica, sans-serif;" ';
        var queryForm = jQuery('<form style="display: inline-block; padding-left: 20px; margin-left: 20px; border-left: 1px solid grey"></form>');
        var queryFrom = jQuery('<input type="text"' + inputStyle + 'data-field="datetime" readonly="">');
        var queryTo = jQuery('<input type="text"' + inputStyle + 'data-field="datetime" readonly="">');
        var doQuery = jQuery('<input type="button" class="button" value="Query">');
        queryForm.append([queryFrom, queryTo, doQuery]);
        pluginsContainer.append(queryForm);
        function getDbSearchCriteria() {
            var from = queryFrom.val();
            var to = queryTo.val();
            if (!from || !to) {
                return null;
            }
            from = from.split(/[-: ]/);
            to = to.split(/[-: ]/);
            return JSON.stringify({
                from: (new Date(from[2], from[1] - 1, from[0], from[3], from[4])).getTime(),
                to: (new Date(to[2], to[1] - 1, to[0], to[3], to[4])).getTime()
            });
        }
        doQuery.click(function(evt) {
            var data = getDbSearchCriteria();
            if (!data) {
                return;
            }
            jQuery.ajax({
                url: '/query-logs',
                type: 'POST',
                data: data,
                contentType: 'application/json'
            });
        });

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@  export  @@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        var exportForm = jQuery('<form style="display: inline-block; padding-left: 20px; margin-left: 20px; border-left: 1px solid grey"></form>');
        var doExport = jQuery('<input type="button" class="button" style="margin-right: 10px;" value="Export Logs">');
        exportForm.append(doExport);
        pluginsContainer.append(exportForm);
        var hiddenExport = document.createElement('a');
        hiddenExport.style.display = 'none';
        doExport.click(function(evt) {
            var data = [];
            var logEntries = consoleWin.logEntries;
            if (!logEntries.length) {
                return;
            }
            for (var i = 0, n = logEntries.length; i < n; i += 1) {
                data.push(JSON.parse(logEntries[i].content).message);
            }
            hiddenExport.download = 'logs_' + (new Date()).getTime() + '.json';
            hiddenExport.href = URL.createObjectURL(new Blob([JSON.stringify(data)], {type: 'application/json'}));
            hiddenExport.click();
        });
        dateTimePicker.DateTimePicker({mode: 'datetime', parentElement: queryForm});

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@                 @@@@@@@@
        // @@@@@@@@   Plugins end   @@@@@@@@
        // @@@@@@@@                 @@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // clear LogMainContainer classes initially
        consoleWin.logMainContainer.className = '';
    });
    log.addAppender(appender);
});
