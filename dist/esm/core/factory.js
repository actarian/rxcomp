import { ReplaySubject, Subject } from 'rxjs';
export const CONTEXTS = {};
export const NODES = {};
export default class Factory {
    constructor(...args) {
        this.rxcompId = -1;
        this.unsubscribe$ = new Subject();
        this.changes$ = new ReplaySubject();
    }
    onInit() { }
    onChanges(changes) { }
    onView() { }
    onDestroy() { }
    pushChanges() {
        this.changes$.next(this);
        this.onView();
    }
}
/*
export default class Factory {

    rxcompId?: number;
    changes$?: BehaviorSubject<Factory>;
    unsubscribe$?: Subject<void>;
    pushChanges?: Function;
    static meta: IFactoryMeta;

    // onInit?: () => void;
    // onChanges?: (changes: Factory | Window) => void;
    // onView?: () => void;
    // onDestroy?: () => void;

    [key: string]: any; // extensible object

    constructor(...args: any[]) {

    }
}
*/
export function getContext(instance) {
    return CONTEXTS[instance.rxcompId];
}
