export interface ILocationInit {
    href: string;
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
}
export declare function getLocationComponents(href: string): ILocationInit;
