import { Http2ServerRequest } from "http2";

export class YowzaServerEvent {
    request: YowzaServerEventRequest;
    response: YowzaServerEventResponse;
    locals: object;

    constructor(req: Http2ServerRequest, option: { protocol: 'http' | 'https' }) {
        this.request = new YowzaServerEventRequest(req, option);
        this.response = new YowzaServerEventResponse();
        this.locals = {};
    }
}

export class YowzaServerEventRequest {
    header: ReadonlyMap<string, string | readonly string[]>;
    readonly url: Readonly<URL>;
    readonly protocol: 'http' | 'https';
    readonly method: string;

    constructor(req: Http2ServerRequest, option: { protocol: 'http' | 'https' }) {
        //protocol
        this.protocol = option.protocol;

        //header
        const header = new Map();
        Object.entries(req.headers).forEach(([key, value]) => {
            if (value !== undefined) {
                header.set(key, value);
            }
        });
        this.header = header;

        //url
        const reqSymbol = Object.getOwnPropertySymbols(req).find(symbol => symbol.description === "req");
        if (reqSymbol) {
            //@ts-expect-error
            const request = req[reqSymbol];
            if (req.headers.authorization) {
                const authorization = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf-8');
                const url = new URL(request.url);
                this.url = new URL(`${url.protocol}//${authorization}@${url.host}${url.pathname ?? ''}${url.search ?? ''}`);
            }
            else {
                this.url = new URL(request.url);
            }
        }
        else {
            if (req.headers.authorization) {
                const authorization = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf-8');
                this.url = new URL(req.url, req.headers.origin ?? `${this.protocol}://${authorization}@${req.headers[':authority'] ?? req.headers.host}`);
            }
            else {
                this.url = new URL(req.url, req.headers.origin ?? `${this.protocol}://${req.headers[':authority'] ?? req.headers.host}`);
            }
        }

        //method
        this.method = req.method as typeof this.method;
    }
}

export class YowzaServerEventResponse {
    header: Map<string, string | number | readonly string[]> = new Map();;

    constructor() {

    }
}