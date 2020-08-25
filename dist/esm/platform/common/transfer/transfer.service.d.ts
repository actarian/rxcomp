export default class TransferService {
    static makeKey(base: string, params?: {
        [key: string]: any;
    }): string;
    static has(key: string): boolean;
    static get<T>(key: string): T | undefined;
    static get(key: string): {
        [key: string]: any;
    } | undefined;
    static set(key: string, value: {
        [key: string]: any;
    }): void;
    static remove(key: string): void;
}
export declare function optionsToKey(v: any, s?: string): string;
