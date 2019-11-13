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
		let expression = node.getAttribute('*for');
		node.removeAttribute('*for');
		if (expression === null) {
			throw ('invalid for');
		}
		if (expression.trim().indexOf('let') !== 0) {
			throw ('invalid for');
		}
		expression = expression.substr(3);
		expression = expression.split(' of ');
		const key = expression[0].trim();
		const data = expression[1].trim();
		this.forFunction = module.makeFunction(data);
		this.key = key;
		this.items = [];
		// console.log('expression', expression);
	}

	onState(state) {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		// resolve
		const items = module.resolve(this.forFunction, state, this) || [];
		const total = items.length;
		const previous = this.items.length;
		let nextSibling = this.forbegin.nextSibling;
		for (let i = 0; i < Math.max(previous, total); i++) {
			if (i < total) {
				const item = items[i];
				if (i < previous) {
					// update
					const clonedNode = nextSibling;
					const instance = this.items[i];
					instance[this.key] = item;
					instance.pushState();
					module.parse(clonedNode, instance);
					nextSibling = nextSibling.nextSibling;
				} else {
					// create
					const clonedNode = node.cloneNode(true);
					this.forend.parentNode.insertBefore(clonedNode, this.forend);
					const instance = new ForItem(this.key, item, i, items, context.parentInstance);
					const instances = module.compile(clonedNode, instance);
					module.parse(clonedNode, instance);
					nextSibling = clonedNode.nextSibling;
					this.items.push(instance);
				}
			} else {
				// remove
				const item = this.items[i];
				const context = Module.getContext(item);
				const node = context.node;
				node.parentNode.removeChild(node);
				module.remove(node);
			}
		}
		this.items.length = items.length;
	}

	/*
	onState_unoptimized(state) {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		while (this.forbegin.nextSibling !== this.forend) {
			const nextSibling = this.forbegin.nextSibling;
			this.forbegin.parentNode.removeChild(nextSibling);
			module.remove(nextSibling);
		}
		const items = module.resolve(this.forFunction, state, this).map((value, index, items) => {
			const item = new ForItem(this.key, value, index, items, this.parent);
			const clonedNode = node.cloneNode(true);
			this.forend.parentNode.insertBefore(clonedNode, this.forend);
			const instances = module.compile(clonedNode, item);
			module.parse(clonedNode, item);
			return item;
		});
		// console.log('ForStructure.onState', items);
	}
	*/

}

ForStructure.meta = {
	selector: '[*for]',
};
