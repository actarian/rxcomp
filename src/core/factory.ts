import { ReplaySubject, Subject } from 'rxjs';
import Module from '../module/module';
import { IContext, IElement, IFactoryMeta } from './types';

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
	static getInputsTokens(instance: Factory, node: IElement, module: Module): { [key: string]: string } {
		const inputs: { [key: string]: string } = {};
		this.meta.inputs?.forEach(key => {
			const expression: string | null = module.getExpression(key, node);
			/*
			let expression: string | null = null;
			if (node.hasAttribute(`[${key}]`)) {
				expression = node.getAttribute(`[${key}]`);
				// console.log('Factory.getInputsTokens.expression.1', expression);
			} else if (node.hasAttribute(`*${key}`)) {
				expression = node.getAttribute(`*${key}`);
				// console.log('Factory.getInputsTokens.expression.2', expression);
			} else if (node.hasAttribute(key)) {
				expression = node.getAttribute(key);
				if (expression) {
					const attribute: string = expression.replace(/({{)|(}})|(")/g, function (substring: string, a, b, c) {
						if (a) {
							return '"+';
						}
						if (b) {
							return '+"';
						}
						if (c) {
							return '\"';
						}
						return '';
					});
					expression = `"${attribute}"`;
					// console.log('Factory.getInputsTokens.expression.3', expression);
				}
			}
			*/
			if (expression) {
				inputs[key] = expression;
			}
		});
		return inputs;
		// return this.meta.inputs || [];
	}
}
export function getContext(instance: Factory): IContext {
	return CONTEXTS[instance.rxcompId];
}
