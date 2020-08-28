export default class Serializer {
    static encode<T>(value: any, encoders: ((from: any) => any)[]): T | undefined;
    static decode<T>(value: any, decoders: ((from: any) => any)[]): T | undefined;
    static encodeJson<T>(value: any): T | undefined;
    static decodeJson<T>(value: any): T | undefined;
    static encodeBase64<T>(value: any): T | undefined;
    static decodeBase64<T>(value: any): T | undefined;
}
export declare function encodeJson(value: any, circularRef?: any, space?: string | number): string;
export declare function encodeJsonWithOptions(circularRef?: any, space?: string | number): (value: any) => string;
export declare function decodeJson(value: string): any;
export declare function encodeBase64(value: string): string | undefined;
export declare function decodeBase64(value: string): any;
