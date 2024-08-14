import { Http2ServerRequest } from "http2";
import { FormFile, YowzaServerResponseCookieData, YowzaServerResponseCookieOption } from "../types";
export declare class YowzaServerEvent {
    request: YowzaServerEventRequest;
    response: YowzaServerEventResponse;
    locals: Record<string, any>;
    params: Record<string, string>;
    constructor(req: Http2ServerRequest, option: {
        protocol: 'http' | 'https';
    });
}
export declare class YowzaServerEventRequest {
    header: ReadonlyMap<string, string>;
    readonly url: Readonly<URL>;
    readonly protocol: 'http' | 'https';
    readonly method: string;
    readonly cookie: ReadonlyMap<string, string>;
    private bodyPromise;
    constructor(req: Http2ServerRequest, option: {
        protocol: 'http' | 'https';
    });
    buffer(): Promise<Buffer>;
    text(): Promise<string>;
    json(): Promise<any>;
    form(): Promise<Map<string, string | FormFile>>;
}
export declare class YowzaServerEventResponse {
    header: Map<string, string | number | readonly string[]>;
    cookie: YowzaServerResponseCookie;
}
export declare class YowzaServerResponseCookie {
    cookieMap: Map<string, YowzaServerResponseCookieData>;
    set(key: string, value: string, option: YowzaServerResponseCookieOption): Map<string, YowzaServerResponseCookieData>;
    get(key: string): YowzaServerResponseCookieData | undefined;
    delete(key: string): boolean;
    stringify(): string[];
}
//# sourceMappingURL=event.d.ts.map