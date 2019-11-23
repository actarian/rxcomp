import Directive from '../core/directive';
import Module from '../module/module';

export default class ClassDirective extends Directive {

	onInit() {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		const expression = node.getAttribute('[class]');
		this.classFunction = module.makeFunction(expression);
		// console.log('ClassDirective.onInit', this.classList, expression);
	}

	onChanges(changes) {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		const classList = module.resolve(this.classFunction, changes, this);
		for (let key in classList) {
			classList[key] ? node.classList.add(key) : node.classList.remove(key);
		}
		// console.log('ClassDirective.onChanges', classList);
	}

}

ClassDirective.meta = {
	selector: `[[class]]`,
};
