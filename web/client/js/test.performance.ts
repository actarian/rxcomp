import { Browser, Component, CoreModule, getContext, Module } from '../../../src/rxcomp';

class RootComponent extends Component {
	onInit() {
		this.index = -1;
		let params = new URLSearchParams(document.location.search.substring(1));
		let paramCount = params.get('count');
		const count = this.count = (paramCount ? parseInt(paramCount) : (this.count || 500));
		this.items = new Array(count).fill(0).map((x, i) => i + 1);
	}
	setIndex(index:number) {
		this.index = index;
		this.pushChanges();
	}
}
RootComponent.meta = {
	selector: '[root-component]',
	inputs: ['count'],
};

class ItemComponent extends Component {
	onInit() {
		const { node } = getContext(this);
		node.innerText = this.item;
	}
	/*
	onInit() {
		console.log('ItemComponent.onInit', this.item);
	}
	*/
}
ItemComponent.meta = {
	selector: '[item-component]',
	inputs: ['item'],
	// template: `<span [innerHTML]="item"></span>`,
};

class AppModule extends Module { }
AppModule.meta = {
	imports: [
		CoreModule
	],
	declarations: [
		ItemComponent,
	],
	bootstrap: RootComponent,
};

Browser.bootstrap(AppModule);
