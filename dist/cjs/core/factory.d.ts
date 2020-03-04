import { ReplaySubject, Subject } from 'rxjs';
import { IContext, IFactoryMeta } from './types';
export declare const CONTEXTS: {
    [key: number]: IContext;
};
export declare const NODES: {
    [key: number]: IContext[];
};
export default class Factory {
    static meta: IFactoryMeta;
    rxcompId: number;
    unsubscribe$: Subject<void>;
    changes$: ReplaySubject<Factory>;
    onInit(): void;
    onChanges(changes: Factory | Window): void;
    onView(): void;
    onDestroy(): void;
    pushChanges(): void;
    [key: string]: any;
    constructor(...args: any[]);
}
export declare function getContext(instance: Factory): IContext;
