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
        const forbegin = this.forbegin = document.createComment(`*for begin`);
        forbegin.rxcompId = node.rxcompId;
        node.parentNode.replaceChild(forbegin, node);
        const forend = this.forend = document.createComment(`*for end`);
        forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
        node.removeAttribute('*for');
    }
    onChanges() {
        const context = getContext(this);
        const module = context.module;
        const node = context.node;
        const tokens = this.tokens;
        let result = this.for || [];
        const isArray = Array.isArray(result);
        const array = isArray ? result : Object.keys(result);
        const total = array.length;
        const previous = this.instances.length;
        for (let i = 0; i < Math.max(previous, total); i++) {
            if (i < total) {
                const key = isArray ? i : array[i];
                const value = isArray ? array[key] : result[key];
                if (i < previous) {
                    // update
                    const instance = this.instances[i];
                    instance[tokens.key] = key;
                    instance[tokens.value] = value;
                }
                else {
                    // create
                    const clonedNode = node.cloneNode(true);
                    delete clonedNode.rxcompId;
                    this.forend.parentNode.insertBefore(clonedNode, this.forend);
                    const args = [tokens.key, key, tokens.value, value, i, total, context.parentInstance];
                    const skipSubscription = true;
                    const instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args, undefined, skipSubscription);
                    if (instance) {
                        module.compile(clonedNode, instance);
                        module.makeInstanceSubscription(instance, context.parentInstance);
                        this.instances.push(instance);
                    }
                }
            }
            else {
                // remove
                const instance = this.instances[i];
                const { node } = getContext(instance);
                node.parentNode.removeChild(node);
                module.remove(node);
            }
        }
        this.instances.length = array.length;
    }
    static getInputsTokens(instance, node, module) {
        const inputs = {};
        const expression = node.getAttribute('*for');
        if (expression) {
            const tokens = ForStructure.getForExpressionTokens(expression);
            instance.tokens = tokens;
            inputs.for = tokens.iterable;
        }
        return inputs;
    }
    static getForExpressionTokens(expression) {
        if (expression === null) {
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
