import { Browser, Component, CoreModule, Module } from '../../src/rxcomp';

class TestComponent extends Component {
	onInit() {
		this.items = [1, 2, 3];
	}
	onItem(item) {
		console.log('item', item);
	}
}
TestComponent.meta = {
	selector: '[test-component]',
};

class SubComponent extends Component {
	onInit() {
		this.background = 'red';
	}
}
SubComponent.meta = {
	selector: '[sub-component]',
	inputs: ['item'],
	template: `<div [innerHTML]="item"></div>`
};

class AppModule extends Module {}
AppModule.meta = {
	imports: [
		CoreModule
	],
	declarations: [SubComponent],
	bootstrap: TestComponent,
};

Browser.bootstrap(AppModule);
