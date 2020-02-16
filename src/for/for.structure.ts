import Factory, { ExpressionFunction, IElement } from '../core/factory';
import Structure from '../core/structure';
import Module, { getContext, IContext } from '../module/module';
import ForItem from './for.item';

export interface IExpressionToken {
	key: string;
	value: string;
	iterable: string;
}

export default class ForStructure extends Structure {

	forbegin: Comment;
	forend: Comment;
	instances: Factory[] = [];
	token: IExpressionToken;
	forFunction: ExpressionFunction;

	onInit() {
		const { module, node } = getContext(this);
		const forbegin: Comment = this.forbegin = document.createComment(`*for begin`);
		forbegin['rxcompId'] = node.rxcompId;
		node.parentNode.replaceChild(forbegin, node);
		const forend: Comment = this.forend = document.createComment(`*for end`);
		forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
		const expression: string = node.getAttribute('*for');
		// this.expression = expression;
		node.removeAttribute('*for');
		const token = this.token = this.getExpressionToken(expression);
		this.forFunction = module.makeFunction(token.iterable);
	}

	onChanges(changes) {
		const context: IContext = getContext(this);
		const module: Module = context.module;
		const node: IElement = context.node;
		// resolve
		const token: IExpressionToken = this.token;
		let result = module.resolve(this.forFunction, changes, this) || [];
		const isArray = Array.isArray(result);
		const array: any[] = isArray ? result : Object.keys(result);
		const total: number = array.length;
		const previous: number = this.instances.length;
		// let nextSibling = this.forbegin.nextSibling;
		for (let i: number = 0; i < Math.max(previous, total); i++) {
			if (i < total) {
				const key: number | string = isArray ? i : array[i];
				const value: any = isArray ? array[key] : result[key];
				if (i < previous) {
					// update
					const instance: Factory = this.instances[i];
					instance[token.key] = key;
					instance[token.value] = value;
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
					delete clonedNode['rxcompId'];
					this.forend.parentNode.insertBefore(clonedNode, this.forend);
					const args = [token.key, key, token.value, value, i, total, context.parentInstance]; // !!! context.parentInstance unused?
					const instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args);
					if (instance) {
						const forItemContext = getContext(instance);
						// console.log('ForStructure', clonedNode, forItemContext.instance.constructor.name);
						module.compile(clonedNode, forItemContext.instance);
						// nextSibling = clonedNode.nextSibling;
						this.instances.push(instance);
					}
				}
			} else {
				// remove
				const instance: Factory = this.instances[i];
				const { node } = getContext(instance);
				node.parentNode.removeChild(node);
				module.remove(node);
			}
		}
		this.instances.length = array.length;
		// console.log('ForStructure', this.instances, token);
	}

	getExpressionToken(expression: string): IExpressionToken {
		if (expression === null) {
			throw ('invalid for');
		}
		if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
			throw ('invalid for');
		}
		const expressions: string[] = expression.split(';').map(x => x.trim()).filter(x => x !== '');
		const forExpressions: string[] = expressions[0].split(' of ').map(x => x.trim());
		let value: string = forExpressions[0].replace(/\s*let\s*/, '');
		const iterable: string = forExpressions[1];
		let key: string = 'index';
		const keyValueMatches: RegExpMatchArray = value.match(/\[(.+)\s*,\s*(.+)\]/);
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

}

ForStructure.meta = {
	selector: '[*for]',
};
