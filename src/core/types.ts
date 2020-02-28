import Module from '../module/module';
import Factory from './factory';
import Pipe from './pipe';

export type PipeMap = { [key: string]: typeof Pipe };

export type PipeList = (typeof Pipe)[];

export type FactoryList = (typeof Factory)[];

export type MatchFunction = (node: HTMLElement) => boolean;

export type SelectorFunction = (node: HTMLElement) => ISelectorResult | false;

export type ExpressionFunction = (payload: any, module: Module) => any;

export interface Type<T> extends Function { new(...args: any[]): T; }

export interface IContext {
	module: Module;
	instance: Factory;
	parentInstance: Factory | Window;
	node: IElement;
	factory: typeof Factory;
	selector: string;
	inputs?: { [key: string]: ExpressionFunction };
	outputs?: { [key: string]: ExpressionFunction };
}

export interface IModuleMeta {
	declarations?: (typeof Factory | typeof Pipe)[];
	exports?: (typeof Factory | typeof Pipe)[];
	imports?: (typeof Module | IModuleMeta)[];
	pipes?: { [key: string]: typeof Pipe };
	factories?: typeof Factory[];
	selectors?: SelectorFunction[];
	bootstrap?: typeof Factory;
	node?: IElement;
	nodeInnerHTML?: string;
}

export interface IFactoryMeta {
	selector: string;
	hosts?: { [key: string]: typeof Factory };
	inputs?: string[];
	outputs?: string[];
	template?: string;
}

export interface IPipeMeta {
	name: string;
}

export interface ISelectorResult {
	node: IElement;
	factory: typeof Factory;
	selector: string;
}

export interface IElement extends HTMLElement {
	rxcompId?: number;
}

export interface IComment extends Comment {
	rxcompId?: number;
}

export interface IText extends Text {
	nodeExpressions?: (ExpressionFunction | string)[];
}

export interface IExpressionToken {
	key: string;
	value: string;
	iterable: string;
}
