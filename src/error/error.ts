import { Observable, of, ReplaySubject } from "rxjs";
import { switchMap, tap } from "rxjs/operators";
import Factory, { getContext } from "../core/factory";
import Module from "../module/module";

export class ModuleError extends Error { }

export class ExpressionError extends Error {
	module: Module;
	instance: Factory;
	expression: string;
	params: any[];
	template: string;

	constructor(error: Error, module: Module, instance: Factory, expression: string, params: any[]) {
		const message: string = `ExpressionError in ${instance.constructor.name} "${expression}"
		${error.message}`;
		super(message);
		this.name = error.name;
		// this.stack = error.stack;
		this.module = module;
		this.instance = instance;
		this.expression = expression;
		this.params = params;
		const { node } = getContext(instance);
		this.template = node.outerHTML;
	}
}

export interface IErrorHandler {
	handle(error: Error): Observable<Error | void>
}

export interface IErrorInterceptor {
	intercept(error: Error | void, next: IErrorHandler): Observable<Error | void>
}

export class ErrorInterceptorHandler implements IErrorHandler {
	constructor(
		private next: IErrorHandler,
		private interceptor: IErrorInterceptor,
	) { }
	handle(error: Error | void): Observable<Error | void> {
		return this.interceptor.intercept(error, this.next);
	}
}

export class DefaultErrorHandler implements IErrorHandler {
	handle(error: Error | void): Observable<Error | void> {
		return of(error);
	}
}

export const ErrorInterceptors: IErrorInterceptor[] = [];

export const nextError$: ReplaySubject<Error> = new ReplaySubject<Error>(1);
export const errors$: Observable<Error | void> = nextError$.pipe(
	switchMap((error: Error) => {
		const chain: IErrorHandler = ErrorInterceptors.reduceRight((next: IErrorHandler, interceptor: IErrorInterceptor) => {
			return new ErrorInterceptorHandler(next, interceptor);
		}, new DefaultErrorHandler());
		return chain.handle(error);
	}),
	tap((error: Error | void) => {
		if (error) {
			console.error(error);
		}
	}),
);
