import { BehaviorSubject, Subject } from 'rxjs';

export type MatchFunction = (node: HTMLElement) => boolean;

export type SelectorFunction = (node: HTMLElement) => ISelectorResult | false;

export interface ISelectorResult {
	node: IElement;
	factory: typeof Factory;
	selector: string;
}

export type ExpressionFunction = () => any;

export interface IFactoryMeta {
	selector: string;
	hosts?: { [key: string]: typeof Factory };
	inputs?: string[];
	outputs?: string[];
	template?: string;
}

export interface IElement extends HTMLElement {
	rxcompId?: number;
}

export interface IText extends Text {
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