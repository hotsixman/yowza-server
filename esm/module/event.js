import streamToPromise from "stream-to-promise";
import { formParser } from '@mntm/multipart';
export class YowzaServerEvent {
    request;
    response;
    locals;
    params;
    constructor(req, option) {
        this.request = new YowzaServerEventRequest(req, option);
        this.response = new YowzaServerEventResponse();
        this.locals = {};
        this.params = {};
    }
}
export class YowzaServerEventRequest {
    header;
    url;
    protocol;
    method;
    cookie;
    bodyPromise;
    constructor(req, option) {
        this.bodyPromise = streamToPromise(req);
        this.protocol = option.protocol;
        const header = new Map();
        Object.entries(req.headers).forEach(([key, value]) => {
            if (value !== undefined) {
                header.set(key, value);
            }
        });
        this.header = header;
        let cookie = new Map();
        if (req.headers['cookie']) {
            req.headers['cookie'].split(';').forEach((cookieString) => {
                const splited = cookieString.split('=');
                cookie.set(decodeURIComponent(splited[0]), decodeURIComponent(splited[1]));
            });
        }
        this.cookie = cookie;
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
    async buffer() {
        return await this.bodyPromise;
    }
    async text() {
        return (await this.buffer()).toString();
    }
    async json() {
        return JSON.parse(await this.text());
    }
    async form() {
        const body = await this.buffer();
        const requestedFormData = formParser(body).result;
        const formData = new Map();
        Object.entries(requestedFormData).forEach(([key, value]) => {
            if (value.headers.filename === undefined && value.headers.mime === undefined) {
                formData.set(key, value.content.toString(value.headers.encoding));
            }
            else {
                formData.set(key, {
                    encoding: value.headers.encoding,
                    mime: value.headers.mime,
                    filename: value.headers.filename,
                    transfer: value.headers.transfer,
                    content: value.content
                });
            }
        });
        return formData;
    }
}
export class YowzaServerEventResponse {
    header = new Map();
    cookie = new YowzaServerResponseCookie();
}
export class YowzaServerResponseCookie {
    cookieMap = new Map();
    set(key, value, option) {
        return this.cookieMap.set(key, {
            value,
            option
        });
    }
    get(key) {
        return this.cookieMap.get(key);
    }
    delete(key) {
        return this.cookieMap.delete(key);
    }
    stringify() {
        return Array.from(this.cookieMap.entries()).map(([key, cookie]) => {
            let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(cookie.value)}`;
            cookieString += `; Path=${encodeURIComponent(cookie.option.path)}`;
            if (cookie.option.domain !== undefined) {
                cookieString += `; Domain=${encodeURIComponent(cookie.option.domain)}`;
            }
            if (cookie.option.expires !== undefined) {
                cookieString += `; Expires=${cookie.option.expires instanceof Date ? cookie.option.expires.toUTCString() : new Date(cookie.option.expires).toUTCString()}`;
            }
            if (cookie.option.httpOnly) {
                cookieString += `; HttpOnly`;
            }
            if (cookie.option.maxAge !== undefined) {
                cookieString += `; Max-Age=${cookie.option.maxAge}`;
            }
            if (cookie.option.partitioned) {
                cookieString += `; Partitioned`;
            }
            if (cookie.option.secure) {
                cookieString += `; Secure`;
            }
            if (cookie.option.sameSite) {
                cookieString += `; SameSite=${cookie.option.sameSite}`;
            }
            return cookieString;
        });
    }
}
//# sourceMappingURL=event.js.map