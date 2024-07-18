/// <reference types="node" />
import { Http2ServerRequest } from "http2";
export declare class YowzaServerEvent {
    request: YowzaServerEventRequest;
    response: YowzaServerEventResponse;
    locals: object;
    constructor(req: Http2ServerRequest, option: {
        protocol: 'http' | 'https';
    });
}
export declare class YowzaServerEventRequest {
    header: ReadonlyMap<string, string>;
    readonly url: Readonly<URL>;
    readonly protocol: 'http' | 'https';
    readonly method: string;
    constructor(req: Http2ServerRequest, option: {
        protocol: 'http' | 'https';
    });
}
export declare class YowzaServerEventResponse {
    header: Map<string, string | number | readonly string[]>;
    constructor();
}
//# sourceMappingURL=event.d.ts.map