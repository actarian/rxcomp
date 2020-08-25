export default class TransferService {
    static makeKey(url: string, params?: {
        [key: string]: any;
    }): string;
    static has(key: string): boolean;
    static get(key: string): {
        [key: string]: any;
    } | undefined;
    static set(key: string, value: {
        [key: string]: any;
    }): void;
    static remove(key: string): void;
    static encode(value: {
        [key: string]: any;
    }): string | undefined;
    static decode<T>(encoded: string): T | undefined;
    static toBase64(s: string): string;
    static fromBase64(s: string): string;
}
