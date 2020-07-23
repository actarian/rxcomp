import { ReplaySubject, Subject } from 'rxjs';
export const CONTEXTS = {};
export const NODES = {};
export default class Factory {
    constructor(...args) {
        this.rxcompId = -1;
        this.unsubscribe$ = new Subject();
        this.changes$ = new ReplaySubject(1);
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
}
export function getContext(instance) {
    return CONTEXTS[instance.rxcompId];
}
