import Factory, { getContext } from '../core/factory';
import Structure from '../core/structure';
import { ExpressionFunction, IComment, IContext, IElement, IFactoryMeta, IForExpressionTokens } from '../core/types';
import Module from '../module/module';
import ForItem from './for.item';

export default class ForStructure extends Structure {
	instances: Factory[] = [];
	forend?: IComment;
	tokens!: IForExpressionTokens;
	forFunction?: ExpressionFunction;
	onInit() {
		// const { module, node } = getContext(this);
		const { node } = getContext(this);
		const forbegin: IComment = document.createComment(`*for begin`);
		forbegin.rxcompId = node.rxcompId;
		node.parentNode!.replaceChild(forbegin, node);
		const forend: IComment = this.forend = document.createComment(`*for end`);
		forbegin.parentNode!.insertBefore(forend, forbegin.nextSibling);
		// const expression: string = node.getAttribute('*for')!;
		node.removeAttribute('*for');
		// const tokens = this.tokens = ForStructure.getForExpressionTokens(expression);
		// this.forFunction = module.makeFunction(tokens.iterable);
		// const inputKey = this.tokens.iterable;
		// console.log('*for', inputKey, this[inputKey]);
	}
	onChanges(changes: Factory | Window) {
		const context: IContext = getContext(this);
		const module: Module = context.module;
		const node: IElement = context.node;
		// resolve
		const tokens: IForExpressionTokens = this.tokens!;
		// let result = module.resolve(this.forFunction!, changes, this) || [];
		const inputKey = tokens.iterable;
		let result = this[inputKey];
		const isArray = Array.isArray(result);
		const array: any[] = isArray ? result : Object.keys(result);
		const total: number = array.length;
		const previous: number = this.instances.length;
		for (let i: number = 0; i < Math.max(previous, total); i++) {
			if (i < total) {
				const key: number | string = isArray ? i : array[i];
				const value: any = isArray ? array[key as number] : result[key];
				if (i < previous) {
					// update
					const instance: Factory = this.instances[i];
					instance[tokens.key] = key;
					instance[tokens.value] = value;
					/*
					if (!nextSibling) {
						const context = getContext(instance);
						const node = context.node;
						this.forend.parentNode.insertBefore(node, this.forend);
					} else {
						nextSibling = nextSibling.nextSibling;
					}
					*/
				} else {
					// create
					const clonedNode: IElement = node.cloneNode(true) as IElement;
					delete clonedNode.rxcompId;
					this.forend!.parentNode!.insertBefore(clonedNode, this.forend!);
					// !!! todo: check context.parentInstance
					const args = [tokens.key, key, tokens.value, value, i, total, context.parentInstance];
					// console.log('ForStructure.makeInstance.ForItem');
					const skipSubscription = true;
					const instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args, undefined, skipSubscription);
					// console.log('ForStructure.instance.created', instance);
					if (instance) {
						// const forItemContext = getContext(instance);
						// console.log('ForStructure', clonedNode, forItemContext.instance.constructor.name);
						// module.compile(clonedNode, forItemContext.instance);
						// const instances: Factory[];
						module.compile(clonedNode, instance);
						module.makeInstanceSubscription(instance, context.parentInstance);
						// console.log('ForStructure.instance.compiled', instances);
						// nextSibling = clonedNode.nextSibling;
						this.instances.push(instance);
					}
				}
			} else {
				// remove
				const instance: Factory = this.instances[i];
				const { node } = getContext(instance);
				node.parentNode!.removeChild(node);
				module.remove(node);
			}
		}
		this.instances.length = array.length;
		// console.log('ForStructure', this.instances, tokens);
	}
	static getInputsTokens(instance: ForStructure): string[] {
		const { node } = getContext(instance);
		const expression: string = node.getAttribute('*for')!;
		const tokens = ForStructure.getForExpressionTokens(expression);
		instance.tokens = tokens;
		// console.log('ForStructure.getInputsTokens', [tokens.iterable]);
		return [tokens.iterable];
	}
	static getForExpressionTokens(expression: string): IForExpressionTokens {
		if (expression === null) {
			throw new Error('invalid for');
		}
		if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
			throw new Error('invalid for');
		}
		const expressions: string[] = expression.split(';').map(x => x.trim()).filter(x => x !== '');
		const forExpressions: string[] = expressions[0].split(' of ').map(x => x.trim());
		let value: string = forExpressions[0].replace(/\s*let\s*/, '');
		const iterable: string = forExpressions[1];
		let key: string = 'index';
		const keyValueMatches: RegExpMatchArray | null = value.match(/\[(.+)\s*,\s*(.+)\]/);
		if (keyValueMatches) {
			key = keyValueMatches[1];
			value = keyValueMatches[2];
		}
		if (expressions.length > 1) {
			const indexExpressions: string[] = expressions[1].split(/\s*let\s*|\s*=\s*index/).map(x => x.trim());
			if (indexExpressions.length === 3) {
				key = indexExpressions[1];
			}
		}
		return { key, value, iterable };
	}
	static meta: IFactoryMeta = {
		selector: '[*for]',
		inputs: ['for'],
	};
}
