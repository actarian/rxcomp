import { Browser, Component, CoreModule, Directive, Module, StyleDirective } from '../../src/rxcomp';

class RootComponent extends Component {
	onInit() {
		this.background = '#b9dbff';
		this.items = [1, 2, 3];
	}
	onItem(item) {
		console.log('RootComponent.item', item);
	}
}
RootComponent.meta = {
	selector: '[root-component]',
};

class SubComponent extends Component {
	onInit() {
		this.background = '#ffb9b9';
	}
	onToggle() {
		// console.log(this.item);
		this.toggle.next(this.item);
	}
}
SubComponent.meta = {
	selector: '[sub-component]:not(.red)',
	inputs: ['item'],
	outputs: ['toggle'],
	template: `<div [style]="{ 'background-color': background }" (click)="onToggle()" [innerHTML]="item"></div>`
};

class HostDirective extends Directive {
	onInit() {
		console.log('style', this.style);
	}
}
HostDirective.meta = {
	selector: '[host]',
	hosts: { style: StyleDirective }
};

class HostedDirective extends Directive {
	onInit() {
		console.log('host', this.host);
	}
}
HostedDirective.meta = {
	selector: '[hosted]',
	hosts: { host: HostDirective }
};

class AppModule extends Module {}
AppModule.meta = {
	imports: [
		CoreModule
	],
	declarations: [
		HostedDirective,
		HostDirective,
		SubComponent
	],
	bootstrap: RootComponent,
};

Browser.bootstrap(AppModule);
