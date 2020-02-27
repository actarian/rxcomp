import { BehaviorSubject, Subject } from 'rxjs';
import { IFactoryMeta } from './types';

export default class Factory {

	rxcompId?: number;
	changes$?: BehaviorSubject<Factory>;
	unsubscribe$?: Subject<void>;
	pushChanges?: Function;
	static meta: IFactoryMeta;

	/*
	onInit?: () => void;
	onChanges?: (changes: Factory | Window) => void;
	onView?: () => void;
	onDestroy?: () => void;
	*/

	[key: string]: any; // extensible object

	constructor(...args: any[]) {

	}
}
