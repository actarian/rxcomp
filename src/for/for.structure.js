import Structure from '../core/structure';
import { getContext } from '../module/module';
import ForItem from './for.item';

export default class ForStructure extends Structure {

	onInit() {
		const { module, node } = getContext(this);
		const forbegin = this.forbegin = document.createComment(`*for begin`);
		forbegin.rxcompId = node.rxcompId;
		node.parentNode.replaceChild(forbegin, node);
		const forend = this.forend = document.createComment(`*for end`);
		forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
		const expression = node.getAttribute('*for');
		// this.expression = expression;
		node.removeAttribute('*for');
		const tokens = this.tokens = this.getExpressionTokens(expression);
		this.forFunction = module.makeFunction(tokens.iterable);
		this.instances = [];
	}

	onChanges(changes) {
		const context = getContext(this);
		const module = context.module;
		const node = context.node;
		// resolve
		const tokens = this.tokens;
		let result = module.resolve(this.forFunction, changes, this) || [];
		const isArray = Array.isArray(result);
		const array = isArray ? result : Object.keys(result);
		const total = array.length;
		const previous = this.instances.length;
		// let nextSibling = this.forbegin.nextSibling;
		for (let i = 0; i < Math.max(previous, total); i++) {
			if (i < total) {
				const key = isArray ? i : array[i];
				const value = isArray ? array[key] : result[key];
				if (i < previous) {
					// update
					const instance = this.instances[i];
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
					const clonedNode = node.cloneNode(true);
					delete clonedNode.rxcompId;
					this.forend.parentNode.insertBefore(clonedNode, this.forend);
					const args = [tokens.key, key, tokens.value, value, i, total, context.parentInstance]; // !!! context.parentInstance unused?
					const instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args);
					const forItemContext = getContext(instance);
					// console.log('ForStructure', clonedNode, forItemContext.instance.constructor.name);
					module.compile(clonedNode, forItemContext.instance);
					// nextSibling = clonedNode.nextSibling;
					this.instances.push(instance);
				}
			} else {
				// remove
				const instance = this.instances[i];
				const { node } = getContext(instance);
				node.parentNode.removeChild(node);
				module.remove(node);
			}
		}
		this.instances.length = array.length;
		// console.log('ForStructure', this.instances, tokens);
	}

	getExpressionTokens(expression) {
		if (expression === null) {
			throw ('invalid for');
		}
		if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
			throw ('invalid for');
		}
		const expressions = expression.split(';').map(x => x.trim()).filter(x => x !== '');
		const forExpressions = expressions[0].split(' of ').map(x => x.trim());
		let value = forExpressions[0].replace(/\s*let\s*/, '');
		const iterable = forExpressions[1];
		let key = 'index';
		const keyValueMatches = value.match(/\[(.+)\s*,\s*(.+)\]/);
		if (keyValueMatches) {
			key = keyValueMatches[1];
			value = keyValueMatches[2];
		}
		if (expressions.length > 1) {
			const indexExpressions = expressions[1].split(/\s*let\s*|\s*=\s*index/).map(x => x.trim());
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
