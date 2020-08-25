export function getLocationComponents(href) {
    let protocol = '';
    let host = '';
    let hostname = '';
    let port = '';
    let pathname = '';
    let search = '';
    let hash = '';
    const regExp = /^((http\:|https\:)?\/\/)?((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])|locahost)?(\:([^\/]+))?(\.?\/[^\?]+)?(\?[^\#]+)?(\#.+)?$/g;
    const matches = href.matchAll(regExp);
    for (let match of matches) {
        protocol = match[2] || '';
        host = hostname = match[3] || '';
        port = match[11] || '';
        pathname = match[12] || '';
        search = match[13] || '';
        hash = match[14] || '';
    }
    return { href, protocol, host, hostname, port, pathname, search, hash };
}
