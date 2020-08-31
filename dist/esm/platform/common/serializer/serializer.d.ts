/**
 * @example Serializer.encode(value, [encodeJson, encodeUriComponent, encodeBase64]);
 * @example Serializer.decode(value, [decodeBase64, decodeUriComponent, decodeJson]);
 */
export default class Serializer {
    static encode<T>(value: any, encoders: ((from: any) => any)[]): T;
    static decode<T>(value: any, decoders: ((from: any) => any)[]): T;
    static encodeJson<T>(value: any): T;
    static decodeJson<T>(value: any): T;
    static encodeBase64<T>(value: any): T;
    static decodeBase64<T>(value: any): T;
}
export declare function encodeJson(value: any, circularRef?: any, space?: string | number): string;
export declare function encodeJsonWithOptions(circularRef?: any, space?: string | number): (value: any) => string;
export declare function decodeJson(value: string): any;
export declare function encodeBase64(value: string): string;
export declare function decodeBase64(value: string): string;
