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
    static getInputsTokens(instance) {
        return this.meta.inputs || [];
    }
}
export function getContext(instance) {
    return CONTEXTS[instance.rxcompId];
}
