import { Component, Factory } from '../../../src/rxcomp';
import { accent, background, foreground } from '../colors/colors';

export default class TodoItemComponent extends Component {

	background: string | null = null;
	foreground: string | null = null;
	accent: string | null = null;

	// onInit() {}

	onChanges(changes: Factory | Window) {
		// console.log('onChanges', changes);
		this.background = background(this.item.id);
		this.foreground = foreground(this.item.id);
		this.accent = accent(this.item.id);
	}

	// onView() {}

	// onDestroy() {}

	onToggle($event: MouseEvent) {
		// console.log('onToggle', $event);
		this.toggle.next($event);
	}

	onRemove($event: MouseEvent) {
		// console.log('onRemove', $event);
		this.remove.next($event);
	}

}

TodoItemComponent.meta = {
	selector: '[todo-item-component]',
	inputs: ['item'],
	outputs: ['toggle', 'remove'],
	// template syntax example
	/*
	template: // html // `
		<div class="content" [style]="{ background: background, color: foreground, '--accent': accent }">
			<button type="button" class="btn--toggle" (click)="onToggle(item)">
				<i class="icon--check" *if="item.done"></i>
				<i class="icon--circle" *if="!item.done"></i>
				<div class="title" [innerHTML]="item.name"></div>
			</button>
			<div class="date" [style]="{ background: backgroundColor, color: color }" [innerHTML]="item.date | date : 'en-US' : { month: 'short', day: '2-digit', year: 'numeric' }"></div>
			<button type="button" class="btn--remove" (click)="onRemove(item)"><i class="icon--remove"></i></button>
		</div>
	`,
	*/
};
