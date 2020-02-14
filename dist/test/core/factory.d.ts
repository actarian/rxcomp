import { BehaviorSubject, Subject } from "rxjs";
export declare type SelectorFunction = (node: HTMLElement) => boolean;
export declare type ExpressionFunction = () => any;
export interface IFactoryMeta {
    selector: string;
    hosts?: {
        [key: string]: typeof Factory;
    };
    inputs?: string[];
    outputs?: string[];
    template?: string;
}
export declare class RxCompElement extends HTMLElement {
    rxcompId?: number;
}
export declare class RxCompText extends Text {
    nodeExpressions?: (ExpressionFunction | string)[];
}
export default class Factory {
    rxcompId?: number;
    changes$?: BehaviorSubject<Factory>;
    unsubscribe$?: Subject<void>;
    pushChanges?: Function;
    static meta: IFactoryMeta;
    constructor(...args: any[]);
}
