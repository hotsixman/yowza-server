import { ServerOptions as HttpsServerOptions } from "https";
import { ServerOptions as Http2ServerOptions } from "http2";
import { ServerOptions as HttpServerOptions } from "http";
import { YowzaServerEvent } from "./module/event";
import { YowzaServerResponse } from "./module/response";
import { YowzaServerError } from "./module/error";
import { ReadStream } from "fs";

//listen option
export interface YowzaServerCreateListenOption {
    protocol: 'http' | 'https'
};
export interface YowzaServerListenOption {
    http?: {
        port: number,
        options?: HttpServerOptions
    },
    http2?: {
        port: number,
        options?: Http2ServerOptions
    },
    https?: {
        port: number,
        options?: HttpsServerOptions
    }
};

//handler
export type YowzaServerHandler<T extends YowzaServerHandlerGeneric = YowzaServerHandlerGeneric> = (event: YowzaServerEvent & T) => Promise<YowzaServerEvent | YowzaServerResponse | YowzaServerError>;
export interface YowzaServerHandlerGeneric {
    locals?: Record<string, any>;
    params?: Readonly<Params>
}
interface Params {
    [key: string]: string
}

//response option
export type YowzaServerResponseOption = YowzaServerTextResponseOption | YowzaServerBufferResponseOption | YowzaServerFileResponseOption | YowzaServerMediaResponseOption;
export interface YowzaServerTextResponseOption {
    type: 'html' | 'json' | 'plain' | 'raw';
    content: string | ReadStream;
}
export interface YowzaServerBufferResponseOption {
    type: 'buffer';
    content: Buffer;
    mime?: string;
}
export interface YowzaServerFileResponseOption {
    type: 'file';
    content: Buffer | ReadStream | Path;
}
export interface YowzaServerMediaResponseOption {
    type: 'media';
    content: Buffer | Path;
    mime?: string;
}
type Path = string;

//response cookie
export interface YowzaServerResponseCookieData {
    value: string;
    option: YowzaServerResponseCookieOption;
}
export interface YowzaServerResponseCookieOption {
    path: string;
    domain?: string;
    expires?: number | Date;
    httpOnly?: boolean;
    maxAge?: number;
    secure?: boolean;
    partitioned?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}

//form file data
export interface FormFile {
    filename?: string;
    mime?: string;
    encoding?: string;
    transfer?: string;
    content: Buffer
}