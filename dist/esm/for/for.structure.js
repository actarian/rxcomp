import { getContext } from '../core/factory';
import Structure from '../core/structure';
import ForItem from './for.item';
export default class ForStructure extends Structure {
    constructor() {
        super(...arguments);
        this.instances = [];
    }
    onInit() {
        const { node } = getContext(this);
        const expression = node.getAttribute('*for');
        this.tokens = ForStructure.getForExpressionTokens(expression);
        const nodeRef = this.nodeRef = document.createComment(`*for`);
        node.parentNode.replaceChild(nodeRef, node);
        node.removeAttribute('*for');
    }
    onChanges() {
        const context = getContext(this);
        const module = context.module;
        const node = context.node;
        const selector = context.selector;
        const parentInstance = context.parentInstance;
        const nodeRef = this.nodeRef;
        const tokens = this.tokens;
        let data = this.for || [];
        const isArray = Array.isArray(data);
        const items = isArray ? data : Object.keys(data);
        const total = items.length;
        const instances = this.instances;
        const previous = instances.length;
        for (let i = 0, len = Math.max(previous, total); i < len; i++) {
            if (i < total) {
                const key = isArray ? i : items[i];
                const value = isArray ? items[key] : data[key];
                if (i < previous) {
                    // update
                    const instance = instances[i];
                    instance[tokens.key] = key;
                    instance[tokens.value] = value;
                }
                else {
                    // create
                    const clonedNode = node.cloneNode(true);
                    nodeRef.parentNode.insertBefore(clonedNode, nodeRef);
                    const args = [tokens.key, key, tokens.value, value, i, total, parentInstance];
                    const instance = module.makeInstance(clonedNode, ForItem, selector, parentInstance, args);
                    if (instance) {
                        module.compile(clonedNode, instance);
                        instances.push(instance);
                    }
                }
            }
            else {
                // remove
                const instance = instances[i];
                const { node } = getContext(instance);
                node.parentNode.removeChild(node);
                module.remove(node);
            }
        }
        instances.length = total;
    }
    static mapExpression(key, expression) {
        const tokens = this.getForExpressionTokens(expression);
        return tokens.iterable;
    }
    static getForExpressionTokens(expression = null) {
        if (expression == null) {
            throw new Error('invalid for');
        }
        if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
            throw new Error('invalid for');
        }
        const expressions = expression.split(';').map(x => x.trim()).filter(x => x !== '');
        const forExpressions = expressions[0].split(' of ').map(x => x.trim());
        let value = forExpressions[0].replace(/\s*let\s*/, '');
        const iterable = forExpressions[1];
        let key = 'index';
        const keyValueMatches = value.match(/\[(.+)\s*,\s*(.+)\]/);
        if (keyValueMatches) {
            key = keyValueMatches[1];
            value = keyValueMatches[2];
        }
        if (expressions.length > 1) {
            const indexExpressions = expressions[1].split(/\s*let\s*|\s*=\s*index/).map(x => x.trim());
            if (indexExpressions.length === 3) {
                key = indexExpressions[1];
            }
        }
        return { key, value, iterable };
    }
}
ForStructure.meta = {
    selector: '[*for]',
    inputs: ['for'],
};
