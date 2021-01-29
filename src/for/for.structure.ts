import Factory, { getContext } from '../core/factory';
import Structure from '../core/structure';
import { IComment, IContext, IElement, IFactoryMeta, IForExpressionTokens } from '../core/types';
import Module from '../module/module';
import ForItem from './for.item';

export default class ForStructure extends Structure {
	instances: Factory[] = [];
	nodeRef!: IComment;
	tokens!: IForExpressionTokens;
	onInit() {
		const { node } = getContext(this);
        const expression = node.getAttribute('*for');
        this.tokens = ForStructure.getForExpressionTokens(expression);
		const nodeRef: IComment = this.nodeRef = document.createComment(`*for`);
		node.parentNode!.replaceChild(nodeRef, node);
		node.removeAttribute('*for');
	}
	onChanges() {
		const context: IContext = getContext(this);
		const module: Module = context.module;
		const node: IElement = context.node;
		const selector: string = context.selector;
		const parentInstance: Factory | Window = context.parentInstance;
		const nodeRef = this.nodeRef;
		const tokens: IForExpressionTokens = this.tokens!;
		let data = this.for || [];
		const isArray = Array.isArray(data);
		const items: any[] = isArray ? data : Object.keys(data);
		const total: number = items.length;
		const instances = this.instances;
		const previous: number = instances.length;
		for (let i: number = 0, len:number = Math.max(previous, total); i < len; i++) {
			if (i < total) {
				const key: number | string = isArray ? i : items[i];
				const value: any = isArray ? items[key as number] : data[key];
				if (i < previous) {
					// update
					const instance: Factory = instances[i];
					instance[tokens.key] = key;
					instance[tokens.value] = value;
				} else {
					// create
					const clonedNode: IElement = node.cloneNode(true) as IElement;
					nodeRef.parentNode!.insertBefore(clonedNode, nodeRef);
					const args = [tokens.key, key, tokens.value, value, i, total, parentInstance];
					const instance = module.makeInstance(clonedNode, ForItem, selector, parentInstance, args);
					if (instance) {
						module.compile(clonedNode, instance);
						instances.push(instance);
					}
				}
			} else {
				// remove
				const instance: Factory = instances[i];
				const { node } = getContext(instance);
				node.parentNode!.removeChild(node);
				module.remove(node);
			}
		}
		instances.length = total;
	}
    static mapExpression(key:string, expression:string) {
        const tokens = this.getForExpressionTokens(expression);
        return tokens.iterable;
    }
	static getForExpressionTokens(expression: string | null = null): IForExpressionTokens {
		if (expression == null) {
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
