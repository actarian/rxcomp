import Serializer, { decodeJson, encodeJson } from "../serializer/serializer";
export default class TransferService {
    static makeKey(base, params) {
        const paramsKey = params ? optionsToKey(params) : '';
        let key = `rxcomp-hydrate-${base}-${paramsKey}`;
        key = key.replace(/(\s+)|(\W+)/g, function (...matches) { return matches[1] ? '' : '_'; });
        // console.log('TransferService.makeKey', key, base, paramsKey);
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
            return json ? Serializer.decode(json, [decodeJson]) : undefined;
        }
        else {
            return undefined;
        }
    }
    static set(key, value) {
        // console.log('TransferService.set', key, value);
        const json = Serializer.encode(value, [encodeJson]);
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
}
export function optionsToKey(v, s = '') {
    if (typeof v === 'number') {
        s += '-' + v.toString();
    }
    else if (typeof v === 'string') {
        s += '-' + v.substr(0, 20);
    }
    else if (v && Array.isArray(v)) {
        s += '-' + v.map(v => optionsToKey(v)).join('');
    }
    else if (v && typeof v === 'object') {
        s += '-' + Object.keys(v).map(k => k + optionsToKey(v[k])).join('-');
    }
    return s;
}
