import { Browser, Component, CoreModule, Module } from '../../src/rxcomp';
import DatePipe from './date/date.pipe';

class RootComponent extends Component {

	onInit() {
		// console.log('RootComponent.onInit');
		this.items = [1, 2];
		this.object = { a: 1, b: 2 };
		this.date = new Date();
	}

}
RootComponent.meta = {
	selector: '[root-component]',
};

class Root2Component extends Component {

	onInit() {
		// console.log('RootComponent.onInit');
		this.items = [2, 3];
		this.object = { a: 2, b: 3 };
		this.date = new Date();
	}

}
Root2Component.meta = {
	selector: '[root-component]',
};

class AppModule extends Module {}
AppModule.meta = {
	imports: [
		CoreModule
	],
	declarations: [
		DatePipe,
	],
	bootstrap: RootComponent,
};

class App2Module extends Module {}
App2Module.meta = {
	imports: [
		CoreModule
	],
	declarations: [
		DatePipe,
	],
	bootstrap: Root2Component,
};

let module = Browser.bootstrap(AppModule);

function init() {
	module.destroy();
	module = Browser.bootstrap(App2Module);
}

setTimeout(() => {
	init();
}, 5000);
