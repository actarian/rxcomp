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

	onChanges(changes) {
		const context = Module.getContext(this);
		const innerHTML = context.module.evaluate(this.innerHtmlExpression, changes);
		// console.log('InnerHtmlDirective.onChanges', this.innerHtmlExpression, innerHTML);
		const node = context.node;
		node.innerHTML = innerHTML;
	}

}

InnerHtmlDirective.meta = {
	selector: `[[innerHTML]],[innerHTML]`
};
