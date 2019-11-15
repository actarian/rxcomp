import Directive from '../core/directive';
import Module from '../module/module';

export default class InnerHtmlDirective extends Directive {

	onInit() {
		const context = Module.getContext(this);
		const node = context.node;
		const selector = context.selector;
		const key = selector.replace(/\[(.+)\]/, (...matches) => {
			return matches[1];
		});
		let expression = node.getAttribute(key);
		if (!expression) {
			throw (`invalid ${key}`);
		}
		if (key === '[innerHTML]') {
			expression = `{{${expression}}}`;
		}
		this.innerHtmlExpression = expression;
		// console.log('InnerHtmlDirective.onInit', node, expression, key);
	}

	onState(state) {
		// console.log('InnerHtmlDirective.onState', this.innerHtmlExpression);
		const context = Module.getContext(this);
		const innerHTML = context.module.evaluate(this.innerHtmlExpression, state);
		const node = context.node;
		node.innerHTML = innerHTML;
		// console.log('InnerHtmlDirective.onState', innerHTML);
	}

}

InnerHtmlDirective.meta = {
	selector: `[[innerHTML]],[innerHTML]`
};
