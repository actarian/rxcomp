import { Subject } from 'rxjs';
import { ExpressionFunction, IContext, IElement, IFactoryMeta } from './types';

export const CONTEXTS: { [key: number]: IContext } = {};
export const NODES: { [key: number]: IContext[] } = {};

export const CONTEXT_MAP:Map<Factory, IContext> = new Map<Factory, IContext>();
export const NODE_MAP:Map<IElement, IContext[]> = new Map<IElement, IContext[]>();
export const EXPRESSION_MAP:Map<string, ExpressionFunction> = new Map<string, ExpressionFunction>();

// console.log(CONTEXT_MAP, NODE_MAP, EXPRESSION_MAP);

export default class Factory {
	static meta: IFactoryMeta;
	unsubscribe$_: Subject<void> | undefined;
	get unsubscribe$(): Subject<void> {
		if (!this.unsubscribe$_) {
			this.unsubscribe$_ = new Subject();
		}
		return this.unsubscribe$_;
	}
	// unsubscribe$: Subject<void> = new Subject();
	// changes$: Subject<Factory> = new Subject();
	// changes$: ReplaySubject<Factory> = new ReplaySubject(1);
	onInit(): void { }
	onChanges(changes: Factory | Window): void { }
	onView(): void { }
	onDestroy(): void { }
	pushChanges(): void {
		// const { module } = getContext(this);
		// if (module.instances) {
		const  { childInstances } = getContext(this);
		for (let i:number = 0, len:number = childInstances.length; i < len; i++) {
			childInstances[i].onParentDidChange(this);
		}
		// 	this.changes$.next(this);
			this.onView();
		// }
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
    static mapExpression(key:string, expression:string) {
        return expression;
    }
}
export function getContext(instance: Factory): IContext {
	return CONTEXT_MAP.get(instance) as IContext;
}
