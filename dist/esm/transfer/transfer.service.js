import { isPlatformBrowser } from "../platform/platform";
export default class TransferService {
    static makeKey(url, params) {
        url = params ? flatMap_(url, params) : url;
        url = url.replace(/(\W)/gm, '_');
        const key = `rxcomp_hydrate_${url}`;
        // console.log('TransferService.makeKey', key, url);
        return key;
    }
    static has(key) {
        const script = document.querySelector(`#${key}`);
        return script !== null;
    }
    static get(key) {
        const node = document.querySelector(`#${key}`);
        if (node && node.firstChild) {
            const json = node.firstChild.nodeValue;
            return json ? this.decode(json) : undefined;
        }
        else {
            return undefined;
        }
    }
    static set(key, value) {
        // console.log('TransferService.set', key, value);
        const json = this.encode(value);
        if (!json) {
            return;
        }
        const text = document.createTextNode(json);
        let node = document.querySelector(`#${key}`);
        if (!node) {
            node = document.createElement('script');
            node.setAttribute('id', key);
            node.setAttribute('type', 'text/template');
            // console.log('node', node!!, 'document', document!!, 'head', document.head!!);
            node.append(text);
            document.head.append(node);
        }
        else {
            node.replaceChild(text, node.firstChild);
        }
    }
    static remove(key) {
        let node = document.querySelector(`#${key}`);
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    static encode(value) {
        let encoded;
        try {
            const pool = new Map();
            const json = JSON.stringify(value, function (key, value) {
                if (typeof value === 'object' && value != null) {
                    if (pool.has(value)) {
                        // console.warn(`TransferService circular reference found, discard key "${key}"`);
                        return;
                    }
                    pool.set(value, true);
                }
                return value;
            });
            // encoded = this.toBase64(encodeURIComponent(json));
            encoded = json;
        }
        catch (error) {
            // console.warn('TransferService.encode.error', value, error);
        }
        return encoded;
    }
    static decode(encoded) {
        let decoded;
        if (encoded) {
            try {
                // decoded = JSON.parse(decodeURIComponent(this.fromBase64(encoded))) as T;
                decoded = JSON.parse(encoded);
            }
            catch (error) {
                // console.warn('TransferService.decode.error', encoded);
            }
        }
        return decoded;
    }
    static toBase64(s) {
        if (isPlatformBrowser) {
            return atob(s);
        }
        else {
            return Buffer.from(s).toString('base64');
        }
    }
    static fromBase64(s) {
        if (isPlatformBrowser) {
            return btoa(s);
        }
        else {
            return Buffer.from(s, 'base64').toString();
        }
    }
}
function flatMap_(s, x) {
    if (typeof x === 'number') {
        s += x.toString();
    }
    else if (typeof x === 'string') {
        s += x.substr(0, 10);
    }
    else if (x && typeof x === 'object') {
        s += '_' + Object.keys(x).map(k => k + '_' + flatMap_('', x[k])).join('_');
    }
    return s;
}
