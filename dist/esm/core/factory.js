import { ReplaySubject, Subject } from 'rxjs';
export const CONTEXTS = {};
export const NODES = {};
export default class Factory {
    constructor(...args) {
        this.rxcompId = -1;
        this.unsubscribe$ = new Subject();
        this.changes$ = new ReplaySubject(1);
        /*
        // !!! PROXY
        const store: { [key: string]: any } = {};
        const handler: ProxyHandler<Factory> = {
            get: function (target: Factory, prop: string, receiver: any) {
                return target[prop];
            },
            set: function (target: Factory, prop: string | number | Symbol, value: any, receiver: any) {
                store[prop as string] = value;
                console.log('Factory updating store', prop, value, store);
                target[prop as string] = value;
                return true;
            }
        }
        const proxy = new Proxy(this, handler);
        console.log('proxy', proxy);
        */
    }
    onInit() { }
    onChanges(changes) { }
    onView() { }
    onDestroy() { }
    pushChanges() {
        const { module } = getContext(this);
        if (module.instances) {
            this.changes$.next(this);
            this.onView();
        }
    }
    onParentDidChange(changes) {
        const { module } = getContext(this);
        // console.log('Component.onParentDidChange', changes);
        module.resolveInputsOutputs(this, changes);
        this.onChanges(changes);
        this.pushChanges();
    }
    static getInputsTokens(instance, node, module) {
        var _a;
        const inputs = {};
        (_a = this.meta.inputs) === null || _a === void 0 ? void 0 : _a.forEach(key => {
            const expression = module.getExpression(key, node);
            /*
            let expression: string | null = null;
            if (node.hasAttribute(`[${key}]`)) {
                expression = node.getAttribute(`[${key}]`);
                // console.log('Factory.getInputsTokens.expression.1', expression);
            } else if (node.hasAttribute(`*${key}`)) {
                expression = node.getAttribute(`*${key}`);
                // console.log('Factory.getInputsTokens.expression.2', expression);
            } else if (node.hasAttribute(key)) {
                expression = node.getAttribute(key);
                if (expression) {
                    const attribute: string = expression.replace(/({{)|(}})|(")/g, function (substring: string, a, b, c) {
                        if (a) {
                            return '"+';
                        }
                        if (b) {
                            return '+"';
                        }
                        if (c) {
                            return '\"';
                        }
                        return '';
                    });
                    expression = `"${attribute}"`;
                    // console.log('Factory.getInputsTokens.expression.3', expression);
                }
            }
            */
            if (expression) {
                inputs[key] = expression;
            }
        });
        return inputs;
        // return this.meta.inputs || [];
    }
}
export function getContext(instance) {
    return CONTEXTS[instance.rxcompId];
}
