import Directive from '../directive/directive';
import Module from '../module/module';

export default class ClassDirective extends Directive {

	onInit() {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		const expression = node.getAttribute('[class]');
		this.classFunction = module.makeFunction(expression);
		// this.classList = [...node.classList.keys()];
		// console.log('ClassDirective.onInit', this.classList, expression);
	}

	onState(state) {
		const context = Module.getContext(this);
		const module = context.module;
		const node = context.node;
		const classList = module.resolve(this.classFunction, state, this);
		Object.keys(classList).forEach(key => {
			if (classList[key]) {
				node.classList.add(key);
			} else {
				node.classList.remove(key);
			}
		});
		// console.log('ClassDirective.onState', classList);
	}

}

ClassDirective.meta = {
	selector: `[[class]]`,
};
