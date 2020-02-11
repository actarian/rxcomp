import { BehaviorSubject, Subject } from "rxjs";

export type SelectorFunction = (node: HTMLElement) => boolean;

export type ExpressionFunction = () => any;

export interface IFactoryMeta {
	selector: string;
	hosts?: { [key: string]: typeof Factory };
	inputs?: string[];
	outputs?: string[];
	template?: string;
}

export class RxCompElement extends HTMLElement {
	rxcompId?: number;
}

export class RxCompText extends Text {
	nodeExpressions?: (ExpressionFunction | string)[];
}

export default class Factory {
	rxcompId?: number;
	changes$?: BehaviorSubject<Factory>;
	unsubscribe$?: Subject<void>;
	/*
	onInit?: () => void;
	onChanges?: (changes: Factory) => void;
	onView?: () => void;
	onDestroy?: () => void;
	*/
	pushChanges?: Function;
	static meta: IFactoryMeta;

	constructor(...args: any[]) {

	}
}
