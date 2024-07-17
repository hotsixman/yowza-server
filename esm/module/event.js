export class YowzaServerEvent {
    request;
    response;
    locals;
    constructor(req, option) {
        this.request = new YowzaServerEventRequest(req, option);
        this.response = new YowzaServerEventResponse();
        this.locals = {};
    }
}
export class YowzaServerEventRequest {
    header;
    url;
    protocol;
    method;
    constructor(req, option) {
        this.protocol = option.protocol;
        const header = new Map();
        Object.entries(req.headers).forEach(([key, value]) => {
            if (value !== undefined) {
                header.set(key, value);
            }
        });
        this.header = header;
        const reqSymbol = Object.getOwnPropertySymbols(req).find(symbol => symbol.description === "req");
        if (reqSymbol) {
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
        this.method = req.method;
    }
}
export class YowzaServerEventResponse {
    header = new Map();
    ;
    constructor() {
    }
}
//# sourceMappingURL=event.js.map