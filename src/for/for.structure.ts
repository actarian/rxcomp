import Factory, { getContext } from '../core/factory';
import Structure from '../core/structure';
import { IComment, IContext, IElement, IFactoryMeta, IForExpressionTokens } from '../core/types';
import Module from '../module/module';
import ForItem from './for.item';

export default class ForStructure extends Structure {
	instances: Factory[] = [];
	forbegin!: IComment;
	forend!: IComment;
	tokens!: IForExpressionTokens;
	onInit() {
		const { node } = getContext(this);
		const forbegin: IComment = this.forbegin = document.createComment(`*for begin`);
		forbegin.rxcompId = node.rxcompId;
		node.parentNode!.replaceChild(forbegin, node);
		const forend: IComment = this.forend = document.createComment(`*for end`);
		forbegin.parentNode!.insertBefore(forend, forbegin.nextSibling);
		node.removeAttribute('*for');
	}
	onChanges() {
		const context: IContext = getContext(this);
		const module: Module = context.module;
		const node: IElement = context.node;
		const tokens: IForExpressionTokens = this.tokens!;
		let result = this.for || [];
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
				} else {
					// create
					const clonedNode: IElement = node.cloneNode(true) as IElement;
					delete clonedNode.rxcompId;
					this.forend.parentNode!.insertBefore(clonedNode, this.forend);
					const args = [tokens.key, key, tokens.value, value, i, total, context.parentInstance];
					const skipSubscription = true;
					const instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args, undefined, skipSubscription);
					if (instance) {
						module.compile(clonedNode, instance);
						module.makeInstanceSubscription(instance, context.parentInstance);
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
	}
	static getInputsTokens(instance: ForStructure, node: IElement, module: Module): { [key: string]: string } {
		const inputs: { [key: string]: string } = {};
		const expression: string = node.getAttribute('*for')!;
		if (expression) {
			const tokens = ForStructure.getForExpressionTokens(expression);
			instance.tokens = tokens;
			inputs.for = tokens.iterable;
		}
		return inputs;
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
