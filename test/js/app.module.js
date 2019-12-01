import { CoreModule, Module } from '../../src/rxcomp';
import AppComponent from './app.component';
import DatePipe from './date/date.pipe';
import TodoItemComponent from './todo-item/todo-item.component';

export default class AppModule extends Module {}

AppModule.meta = {
	imports: [
		CoreModule
	],
	declarations: [
		TodoItemComponent,
		DatePipe,
	],
	bootstrap: AppComponent,
};
