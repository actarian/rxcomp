import { interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Browser, Component, CoreModule, Module } from '../../../src/rxcomp';
import DatePipe from './date/date.pipe';

// !!! todo: check {{ item | json }} vs [innerHTML]="item | json"

class RootComponent extends Component {
	html = /* html */ `<b class="bold">bold</b>`;
	valueUndefined = undefined;
	valueDefined = 1;
	ticks = -1;
	items = [1, 2];
	object = { a: 1, b: 2 };
	date = new Date();

	onInit() {
		// console.log('RootComponent.onInit');
		interval(1000).pipe(
			takeUntil(this.unsubscribe$)
		).subscribe(ticks => {
			this.ticks = ticks;
			this.pushChanges();
		});
	}

}
RootComponent.meta = {
	selector: '[root-component]',
};

class Root2Component extends Component {
	html = /* html */ `<strong class="bold">strong</strong>`;
	valueUndefined = undefined;
	valueDefined = 2;
	ticks = -1;
	items = [2, 3];
	object = { a: 2, b: 3 };
	date = new Date();

	onInit() {
		// console.log('RootComponent.onInit');
		interval(1000).pipe(
			takeUntil(this.unsubscribe$)
		).subscribe(ticks => {
			this.ticks = ticks;
			this.pushChanges();
		});
	}

}
Root2Component.meta = {
	selector: '[root-component]',
};

class AppModule extends Module { }
AppModule.meta = {
	imports: [
		CoreModule
	],
	declarations: [
		DatePipe,
	],
	bootstrap: RootComponent,
};

class App2Module extends Module { }
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
