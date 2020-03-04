import { ReplaySubject, Subject } from 'rxjs';
import { IContext, IFactoryMeta } from './types';

export const CONTEXTS: { [key: number]: IContext } = {};
export const NODES: { [key: number]: IContext[] } = {};

export default class Factory {

	static meta: IFactoryMeta;

	rxcompId: number = -1;

	unsubscribe$: Subject<void> = new Subject();
	changes$: ReplaySubject<Factory> = new ReplaySubject(1);

	onInit(): void { }
	onChanges(changes: Factory | Window): void { }
	onView(): void { }
	onDestroy(): void { }

	pushChanges(): void {
		this.changes$.next(this);
		this.onView();
	}

	[key: string]: any; // extensible object

	constructor(...args: any[]) {

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

export function getContext(instance: Factory): IContext {
	return CONTEXTS[instance.rxcompId];
}
