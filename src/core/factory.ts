import { Subject } from "rxjs";

export type SelectorFunction = (node: HTMLElement) => boolean;

export interface IFactoryMeta {
	selector: string;
	hosts?: { [key: string]: typeof Factory };
	inputs?: string[];
	outputs?: string[];
	template?: string;
}

export default abstract class Factory {
	unsubscribe$: Subject<void>;
	pushChanges: Function;
	static meta: IFactoryMeta;
}
