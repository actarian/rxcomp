"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocationComponents = void 0;
var tslib_1 = require("tslib");
function getLocationComponents(href) {
    var e_1, _a;
    var protocol = '';
    var host = '';
    var hostname = '';
    var port = '';
    var pathname = '';
    var search = '';
    var hash = '';
    var regExp = /^((http\:|https\:)?\/\/)?((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])|locahost)?(\:([^\/]+))?(\.?\/[^\?]+)?(\?[^\#]+)?(\#.+)?$/g;
    var matches = [];
    var match;
    while ((match = regExp.exec(href)) !== null) {
        matches.push(match);
    }
    try {
        for (var matches_1 = tslib_1.__values(matches), matches_1_1 = matches_1.next(); !matches_1_1.done; matches_1_1 = matches_1.next()) {
            var match_1 = matches_1_1.value;
            protocol = match_1[2] || '';
            host = hostname = match_1[3] || '';
            port = match_1[11] || '';
            pathname = match_1[12] || '';
            search = match_1[13] || '';
            hash = match_1[14] || '';
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (matches_1_1 && !matches_1_1.done && (_a = matches_1.return)) _a.call(matches_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return { href: href, protocol: protocol, host: host, hostname: hostname, port: port, pathname: pathname, search: search, hash: hash };
}
exports.getLocationComponents = getLocationComponents;
