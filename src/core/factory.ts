import { BehaviorSubject, Subject } from 'rxjs';
import { IFactoryMeta } from './types';

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
