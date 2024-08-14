import { Http2ServerRequest } from "http2";
import streamToPromise from "stream-to-promise";
import { formParser } from '@mntm/multipart';
import { FormFile, YowzaServerResponseCookieData, YowzaServerResponseCookieOption } from "../types";

export class YowzaServerEvent {
    request: YowzaServerEventRequest;
    response: YowzaServerEventResponse;
    locals: Record<string, any>;
    params: Record<string, string>;

    constructor(req: Http2ServerRequest, option: { protocol: 'http' | 'https' }) {
        this.request = new YowzaServerEventRequest(req, option);
        this.response = new YowzaServerEventResponse();
        this.locals = {};
        this.params = {};
    }
}

export class YowzaServerEventRequest {
    header: ReadonlyMap<string, string>;
    readonly url: Readonly<URL>;
    readonly protocol: 'http' | 'https';
    readonly method: string;
    readonly cookie: ReadonlyMap<string, string>;
    private bodyPromise: Promise<Buffer>;

    constructor(req: Http2ServerRequest, option: { protocol: 'http' | 'https' }) {
        //bodyPromise
        this.bodyPromise = streamToPromise(req);

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

        //cookie
        let cookie = new Map();
        if (req.headers['cookie']) {
            req.headers['cookie'].split(';').forEach((cookieString) => {
                const splited = cookieString.split('=');
                cookie.set(decodeURIComponent(splited[0]).trim(), decodeURIComponent(splited[1]));
            })
        }
        this.cookie = cookie;

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

    async buffer() {
        return await this.bodyPromise;
    }

    async text() {
        return (await this.buffer()).toString();
    }

    async json() {
        return JSON.parse(await this.text())
    }

    async form() {
        const body = await this.buffer()
        const requestedFormData = formParser(body).result;

        const formData: Map<string, string | FormFile> = new Map();

        Object.entries(requestedFormData).forEach(([key, value]) => {
            if (value.headers.filename === undefined && value.headers.mime === undefined) {
                formData.set(key, value.content.toString(value.headers.encoding as BufferEncoding | undefined));
            }
            else {
                formData.set(key, {
                    encoding: value.headers.encoding,
                    mime: value.headers.mime,
                    filename: value.headers.filename,
                    transfer: value.headers.transfer,
                    content: value.content
                })
            }
        })

        return formData;
    }
}

export class YowzaServerEventResponse {
    header: Map<string, string | number | readonly string[]> = new Map();
    cookie: YowzaServerResponseCookie = new YowzaServerResponseCookie();
}

export class YowzaServerResponseCookie {
    cookieMap: Map<string, YowzaServerResponseCookieData> = new Map();

    set(key: string, value: string, option: YowzaServerResponseCookieOption) {
        return this.cookieMap.set(key, {
            value,
            option
        })
    }

    get(key: string) {
        return this.cookieMap.get(key);
    }

    delete(key: string) {
        return this.cookieMap.delete(key);
    }

    stringify(): string[] {
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
        })
    }
}