import { getContext } from '../core/factory';
import Structure from '../core/structure';
import ForItem from './for.item';
export default class ForStructure extends Structure {
    constructor() {
        super(...arguments);
        this.instances = [];
    }
    onInit() {
        const { module, node } = getContext(this);
        const forbegin = document.createComment(`*for begin`);
        forbegin.rxcompId = node.rxcompId;
        node.parentNode.replaceChild(forbegin, node);
        const forend = this.forend = document.createComment(`*for end`);
        forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
        const expression = node.getAttribute('*for');
        node.removeAttribute('*for');
        const token = this.token = this.getExpressionToken(expression);
        this.forFunction = module.makeFunction(token.iterable);
    }
    onChanges(changes) {
        const context = getContext(this);
        const module = context.module;
        const node = context.node;
        // resolve
        const token = this.token;
        let result = module.resolve(this.forFunction, changes, this) || [];
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
                    instance[token.key] = key;
                    instance[token.value] = value;
                    /*
                    if (!nextSibling) {
                        const context = getContext(instance);
                        const node = context.node;
                        this.forend.parentNode.insertBefore(node, this.forend);
                    } else {
                        nextSibling = nextSibling.nextSibling;
                    }
                    */
                }
                else {
                    // create
                    const clonedNode = node.cloneNode(true);
                    delete clonedNode.rxcompId;
                    this.forend.parentNode.insertBefore(clonedNode, this.forend);
                    const args = [token.key, key, token.value, value, i, total, context.parentInstance]; // !!! context.parentInstance unused?
                    const instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args);
                    if (instance) {
                        const forItemContext = getContext(instance);
                        // console.log('ForStructure', clonedNode, forItemContext.instance.constructor.name);
                        module.compile(clonedNode, forItemContext.instance);
                        // nextSibling = clonedNode.nextSibling;
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
        // console.log('ForStructure', this.instances, token);
    }
    getExpressionToken(expression) {
        if (expression === null) {
            throw ('invalid for');
        }
        if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
            throw ('invalid for');
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
};
