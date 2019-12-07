# 💎 RxComp

[![Licence](https://img.shields.io/github/license/actarian/rxcomp.svg)](https://github.com/actarian/rxcomp)

[RxComp](https://github.com/actarian/rxcomp) is a reactive component library built on top of [RxJs](https://github.com/ReactiveX/rxjs) that mimics the [Angular](https://angular.io/) declarative syntax. 

If you like Angular declarative syntax but you just want go Vanilla, RxComp library come in useful.

 lib & dependancy | size
:-----------------|:----------------------------------------------------------------------------------------------|
rxcomp.min.js     | ![](https://img.badgesize.io/actarian/rxcomp/master/dist/rxcomp.min.js.svg?compression=gzip)
rxcomp.min.js     | ![](https://img.badgesize.io/actarian/rxcomp/master/dist/rxcomp.min.js.svg)
rxjs.min.js       | ![](https://img.badgesize.io/https://unpkg.com/@reactivex/rxjs@6.5.3/dist/global/rxjs.umd.min.js.svg?compression=gzip)
rxjs.min.js       | ![](https://img.badgesize.io/https://unpkg.com/@reactivex/rxjs@6.5.3/dist/global/rxjs.umd.min.js.svg)
 
> [TodoMvc demo](https://actarian.github.io/rxcomp-todomvc/)  
> [TodoMvc source](https://github.com/actarian/rxcomp-todomvc)  
___

### What is included
* Modules *```imports```, ```exports```*
* Components *```inputs```, ```outputs```, ```hosts```, ```template```*
* Structures *```ForStructure```, ```IfStructure```*
* Directives *```ClassDirective```, ```EventDirective```, ```InnerHtmlDirective```, ```StyleDirective```*
* Pipes *```JsonPipe```*
* Declarative Syntax
* OnPush Strategy via *```pushChanges```* method
* Automatic Subscription / Unsubscription
* Optional Chaining
* Component Template

___

### What is NOT included
* ~~Two-Way Data Binding~~
* ~~Dependency Injection~~
* ~~Routing~~
* ~~Form Validation~~
* ~~Reactive Forms~~
* ~~Server Side Rendering~~

___

## Installation and Usage

### ES6 via npm
```
npm install rxcomp --save
```
___

### CDN

For CDN, you can use unpkg

```html
<script src="https://unpkg.com/rxcomp@1.0.0-alpha.10/dist/rxcomp.min.js"></script>
```

The global namespace for RxComp is `rxcomp`

```javascript
import { CoreModule, Module } from 'rxcomp';
```
___

### Dependancy

This library depend on [RxJs](https://github.com/ReactiveX/rxjs)  
install via npm or include via script  

```
npm install rxjs --save
```

```html
<script src="https://unpkg.com/@reactivex/rxjs@6.5.3/dist/global/rxjs.umd.min.js"></script>
```

___

### Bootstrapping Module

```javascript
import { CoreModule, Module } from 'rxcomp';

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
```
___

### Component Definition

```javascript
export default class TodoItemComponent extends Component {

    onChanges(changes) {
        this.color = color(changes.item.id);
    }

    onToggle($event) {
        this.toggle.next($event);
    }

    onRemove($event) {
        this.remove.next($event);
    }

}

TodoItemComponent.meta = {
    selector: '[todo-item-component]',
    inputs: ['item'],
	outputs: ['toggle', 'remove'],
	// hosts: { host: HostFactory },
    template: /* html */ `
        <button type="button" class="btn--toggle" (click)="onToggle(item)">
            <div class="date" [innerHTML]="item.date | date : 'en-US' : { month: 'short', day: '2-digit', year: 'numeric' }"></div>
            <div class="title" [innerHTML]="item.name"></div>
        </button>
        <button type="button" class="btn--remove" (click)="onRemove(item)">
            <i class="icon--remove"></i>
        </button>
    `,
};

```
___

### Declarative Syntax

```html
<li class="list__item" *for="let item of items" [class]="{ done: item.done }" [style]="{ background: background, color: foreground, '--accent': accent }" todo-item-component [item]="item" (toggle)="onToggleItem($event)" (remove)="onRemoveItem($event)">
    <button type="button" class="btn--toggle" (click)="onToggle(item)">
        <div class="date" [innerHTML]="item.date | date : 'en-US' : { month: 'short', day: '2-digit', year: 'numeric' }"></div>
        <div class="title" [innerHTML]="item.name"></div>
    </button>
    <button type="button" class="btn--remove" (click)="onRemove(item)">
        <i class="icon--remove"></i>
    </button>
</li>
```
___

### LifeCycle Hooks

```javascript
onInit() {
} 

onChanges(changes) {	
}

onView() {	
}

onDestroy() {
}
```
___
### Browser Compatibility
RxComp supports all browsers that are [ES5-compliant](http://kangax.github.io/compat-table/es5/) (IE8 and below are not supported).
___
## Contributing

*Pull requests are welcome and please submit bugs 🐞*
___

### Install packages
```
npm install
```
___

### Build, Serve & Watch 
```
gulp
```
___

### Build Dist
```
gulp build --target dist
```
___

*Thank you for taking the time to provide feedback and review. This feedback is appreciated and very helpful 🌈*

[![GitHub forks](https://img.shields.io/github/forks/actarian/rxcomp.svg?style=social&label=Fork&maxAge=2592000)](https://gitHub.com/actarian/rxcomp/network/)  [![GitHub stars](https://img.shields.io/github/stars/actarian/rxcomp.svg?style=social&label=Star&maxAge=2592000)](https://GitHub.com/actarian/rxcomp/stargazers/)  [![GitHub followers](https://img.shields.io/github/followers/actarian.svg?style=social&label=Follow&maxAge=2592000)](https://github.com/actarian?tab=followers)

* [Github Project Page](https://github.com/actarian/rxcomp)  

*If you find it helpful, feel free to contribute in keeping this library up to date via [PayPal](https://www.paypal.me/circledev/5)*

[![PayPal](https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png)](https://www.paypal.me/circledev/5)
___

## Contact

* Luca Zampetti <lzampetti@gmail.com>
* Follow [@actarian](https://twitter.com/actarian) on Twitter

[![Twitter Follow](https://img.shields.io/twitter/follow/actarian.svg?style=social&label=Follow%20@actarian)](https://twitter.com/actarian)
___

## Release Notes
Changelog [here](https://github.com/actarian/rxcomp/blob/master/CHANGELOG.md).

---

## 1.0.0-alpha.10
* Added meta hosts { key: Factory }

---

## 1.0.0-alpha.8
* Added :not selector
* Fixing TextNode parser

---

### 1.0.0-alpha.7
* Fixing Component scope  

---

### 1.0.0-alpha.6
* Added Module import / export  

---

### 1.0.0-alpha.5

* Initial release of RxComp library
