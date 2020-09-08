export { default as ClassDirective } from './class/class.directive';
export { default as CoreModule } from './core.module';
export { default as Component } from './core/component';
export { default as Context } from './core/context';
export { default as Directive } from './core/directive';
export { default as Factory, getContext } from './core/factory';
export { default as Pipe } from './core/pipe';
export { default as Structure } from './core/structure';
export { DefaultErrorHandler, ErrorInterceptorHandler, ErrorInterceptors, errors$, ExpressionError, ModuleError, nextError$ } from './error/error';
export { default as EventDirective } from './event/event.directive';
export { default as ForItem } from './for/for.item';
export { default as ForStructure } from './for/for.structure';
export { default as HrefTargetDirective } from './href/href-target.directive';
export { default as HrefDirective } from './href/href.directive';
export { default as IfStructure } from './if/if.structure';
export { default as InnerHtmlDirective } from './inner-html/inner-html.directive';
export { default as JsonComponent } from './json/json.component';
export { default as JsonPipe } from './json/json.pipe';
export { default as Module, getContextByNode, getHost, getParsableContextByElement } from './module/module';
export { default as Browser } from './platform/browser';
export { getLocationComponents } from './platform/common/location/location';
export { decodeBase64, decodeJson, default as Serializer, encodeBase64, encodeJson, encodeJsonWithOptions } from './platform/common/serializer/serializer';
export { default as TransferService, optionsToKey } from './platform/common/transfer/transfer.service';
export { WINDOW } from './platform/common/window/window';
export { default as Platform, isPlatformBrowser, isPlatformServer, isPlatformWorker, PLATFORM_BROWSER, PLATFORM_JS_DOM, PLATFORM_NODE, PLATFORM_WEB_WORKER } from './platform/platform';
export { default as SrcDirective } from './src/src.directive';
export { default as StyleDirective } from './style/style.directive';
