export const WINDOW: Window = ((typeof self === 'object' && self.self === self && self) || (typeof global === 'object' && global.global === global && global) || this) as unknown as Window;
