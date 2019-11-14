import Directive from '../directive/directive';
import Module from '../module/module';

export default class InnerHtmlDirective extends Directive {

	onInit() {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		const selector = context.selector;
		const key = selector.replace(/\[(.+)\]/, (...matches) => {
			return matches[1];
		});
		let expression = node.getAttribute(key);
		if (!expression) {
			throw (`invalid ${key}`);
		}
		if (key === 'innerHTML') {
			expression = expression.replace(/{{(.+)}}/, (...matches) => {
				return matches[1];
			});
		}
		this.innerHtmlFunction = module.makeFunction(expression);
		// console.log('InnerHtmlDirective.onInit', node, expression, selector);
	}

	onState(state) {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		const innerHTML = module.resolve(this.innerHtmlFunction, state, this);
		node.innerHTML = String(innerHTML);
		// console.log('InnerHtmlDirective.onState', state, innerHTML);
	}

}

InnerHtmlDirective.meta = {
	selector: `[[innerHTML]],[innerHTML]`
};
