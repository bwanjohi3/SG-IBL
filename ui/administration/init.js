export function initMirrors() {
    var reportTemplateID = 'web-document-viewer-template'; var mirrorsJSId = 'mirrors-script-all'; var mirrorsCSSId = 'mirrors-css-all';
    if (!document.getElementById(mirrorsJSId)) {
        var mirrorsJSDom = document.createElement('script');
        mirrorsJSDom.id = mirrorsJSId;
        mirrorsJSDom.type = 'text/javascript';
        mirrorsJSDom.src = '/s/mirrors/mirrors/js/mirrors.js.all.js';
        document.head.appendChild(mirrorsJSDom);
    };
    if (!document.getElementById(reportTemplateID)) {
        var reportTemplateDom = document.createElement('script');
        reportTemplateDom.id = reportTemplateID;
        reportTemplateDom.setAttribute('for', 'mirrors-report-templates');
        reportTemplateDom.type = 'text/html';
        reportTemplateDom.src = '/s/mirrors/mirrors/html/report-viewer.html';
        document.head.appendChild(reportTemplateDom);
    };
    if (!document.getElementById(mirrorsCSSId)) {
        var mirrorsCSSDom = document.createElement('link');
        mirrorsCSSDom.id = mirrorsCSSId;
        mirrorsCSSDom.type = 'text/css';
        mirrorsCSSDom.setAttribute('href', '/s/mirrors/mirrors/css/mirrors.css.all.css');
        mirrorsCSSDom.setAttribute('rel', 'stylesheet');
        document.head.appendChild(mirrorsCSSDom);
    }
}
