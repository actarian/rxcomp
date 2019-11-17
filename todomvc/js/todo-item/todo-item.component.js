import { Component } from '../../../src/rxcomp';
import { color } from '../colors/colors';

export default class TodoItemComponent extends Component {

	onChanges(changes) {
		// console.log('onChanges', changes);
		this.backgroundColor = color(this.item.id, 0.15);
		this.color = color(this.item.id);
	}

	onToggle($event) {
		// console.log('onToggle', $event);
		this.toggle.next($event);
	}

	onRemove($event) {
		// console.log('onRemove', $event);
		this.remove.next($event);
	}

}

TodoItemComponent.meta = {
	selector: '[todo-item-component]',
	inputs: ['item'],
	outputs: ['toggle', 'remove'],
	template: /* html */ `
		<button type="button" class="btn--toggle" [style]="{ color: color }" (click)="onToggle(item)">
			<i class="icon--check" *if="item.done"></i>
			<i class="icon--circle" *if="!item.done"></i>
		</button>
		<div class="title" [style]="{ color: color }" [innerHTML]="item.name"></div>
		<div class="date" [style]="{ background: backgroundColor, color: color }" [innerHTML]="item.date | date : 'en-US' : { month: 'short', day: '2-digit', year: 'numeric' }"></div>
		<button type="button" class="btn--remove" [style]="{ color: color }" (click)="onRemove(item)"><i class="icon--remove"></i></button>
	`,
};
