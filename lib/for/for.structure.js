import Component from '../component/component';
import Module from '../module/module';
import Structure from '../structure/structure';
import ForItem from './for.item';

export default class ForStructure extends Structure {

	onInit() {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		const forbegin = this.forbegin = document.createComment(`*for begin`);
		node.parentNode.replaceChild(forbegin, node);
		const forend = this.forend = document.createComment(`*for end`);
		forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
		const expression = node.getAttribute('*for');
		node.removeAttribute('*for');
		const tokens = this.tokens = this.getExpressionTokens(expression);
		this.forFunction = module.makeFunction(tokens.iterable);
		this.instances = [];
	}

	onState(state) {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		// resolve
		const tokens = this.tokens;
		let result = module.resolve(this.forFunction, state, this) || [];
		const isArray = Array.isArray(result);
		const array = isArray ? result : Object.keys(result);
		const total = array.length;
		const previous = this.instances.length;
		let nextSibling = this.forbegin.nextSibling;
		for (let i = 0; i < Math.max(previous, total); i++) {
			if (i < total) {
				const key = isArray ? i : array[i];
				const value = isArray ? array[key] : result[key];
				if (i < previous) {
					// update
					const clonedNode = nextSibling;
					const instance = this.instances[i];
					instance[tokens.key] = key;
					instance[tokens.value] = value;
					instance.pushState();
					module.parse(clonedNode, instance);
					nextSibling = nextSibling.nextSibling;
				} else {
					// create
					const clonedNode = node.cloneNode(true);
					this.forend.parentNode.insertBefore(clonedNode, this.forend);
					const args = [tokens.key, key, tokens.value, value, i, total, context.parentInstance]; // !!! context.parentInstance unused?
					const instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args);
					const forItemContext = Module.getContext(instance);
					// const instance = new ForItem(tokens.key, key, tokens.value, value, i, total, context.parentInstance);
					// const forItemContext = module.makeContext(instance, context.parentInstance, clonedNode, context.selector);
					const instances = module.compile(clonedNode, forItemContext);
					console.log(instances.length, instances.filter(x => x.constructor instanceof Component).length);
					module.parse(clonedNode, instance);
					nextSibling = clonedNode.nextSibling;
					this.instances.push(instance);
				}
			} else {
				// remove
				const instance = this.instances[i];
				const context = Module.getContext(instance);
				const node = context.node;
				node.parentNode.removeChild(node);
				module.remove(node);
			}
		}
		this.instances.length = array.length;
		// console.log(this.instances, tokens);
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

	/*
	onState_unoptimized(state) {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		const tokens = this.tokens;
		while (this.forbegin.nextSibling !== this.forend) {
			const nextSibling = this.forbegin.nextSibling;
			this.forbegin.parentNode.removeChild(nextSibling);
			module.remove(nextSibling);
		}
		const array = module.resolve(this.forFunction, state, this).map((value, index, array) => {
			const item = new ForItem(tokens.key, index, tokens.value, value, array, this.parent);
			const clonedNode = node.cloneNode(true);
			this.forend.parentNode.insertBefore(clonedNode, this.forend);
			const instances = module.compile(clonedNode, item);
			module.parse(clonedNode, item);
			return item;
		});
		// console.log('ForStructure.onState', array);
	}
	*/

}

ForStructure.meta = {
	selector: '[*for]',
};
