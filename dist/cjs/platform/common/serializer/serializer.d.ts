export default class Serializer {
    static encode<T>(value: any, encoders: ((from: any) => any)[]): T | undefined;
    static decode<T>(value: any, decoders: ((from: any) => any)[]): T | undefined;
}
export declare function encodeJson(value: any): string;
export declare function decodeJson(value: string): any;
export declare function encodeBase64(value: string): string;
export declare function decodeBase64(value: string): string;
