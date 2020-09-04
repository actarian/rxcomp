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
		const { module } = getContext(this);
		if (module.instances) {
			this.changes$.next(this);
			this.onView();
		}
	}
	onParentDidChange(changes: Factory | Window): void {
		const { module } = getContext(this);
		// console.log('Component.onParentDidChange', changes);
		module.resolveInputsOutputs(this, changes);
		this.onChanges(changes);
		this.pushChanges();
	}
	[key: string]: any; // extensible object
	constructor(...args: any[]) {
		/*
		// !!! PROXY
		const store: { [key: string]: any } = {};
		const handler: ProxyHandler<Factory> = {
			get: function (target: Factory, prop: string, receiver: any) {
				return target[prop];
			},
			set: function (target: Factory, prop: string | number | Symbol, value: any, receiver: any) {
				store[prop as string] = value;
				console.log('Factory updating store', prop, value, store);
				target[prop as string] = value;
				return true;
			}
		}
		const proxy = new Proxy(this, handler);
		console.log('proxy', proxy);
		*/
	}
	static getInputsTokens(instance: Factory): string[] {
		return this.meta.inputs || [];
	}
}
export function getContext(instance: Factory): IContext {
	return CONTEXTS[instance.rxcompId];
}
