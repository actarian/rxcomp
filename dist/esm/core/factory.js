import { Subject } from 'rxjs';
export const CONTEXTS = {};
export const NODES = {};
export const CONTEXT_MAP = new Map();
export const NODE_MAP = new Map();
export const EXPRESSION_MAP = new Map();
// console.log(CONTEXT_MAP, NODE_MAP, EXPRESSION_MAP);
export default class Factory {
    constructor(...args) {
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
    get unsubscribe$() {
        if (!this.unsubscribe$_) {
            this.unsubscribe$_ = new Subject();
        }
        return this.unsubscribe$_;
    }
    // unsubscribe$: Subject<void> = new Subject();
    // changes$: Subject<Factory> = new Subject();
    // changes$: ReplaySubject<Factory> = new ReplaySubject(1);
    onInit() { }
    onChanges(changes) { }
    onView() { }
    onDestroy() { }
    pushChanges() {
        const { childInstances } = getContext(this);
        const instances = childInstances.slice();
        let instance;
        for (let i = 0, len = instances.length; i < len; i++) {
            instance = instances[i];
            if (childInstances.indexOf(instance) !== -1) {
                instances[i].onParentDidChange(this);
            }
        }
        // 	this.changes$.next(this);
        this.onView();
    }
    onParentDidChange(changes) {
        const { module } = getContext(this);
        // console.log('Component.onParentDidChange', changes);
        module.resolveInputsOutputs(this, changes);
        this.onChanges(changes);
        this.pushChanges();
    }
    static mapExpression(key, expression) {
        return expression;
    }
}
export function getContext(instance) {
    return CONTEXT_MAP.get(instance);
}
