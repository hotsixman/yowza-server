import { ServerOptions as HttpsServerOptions } from "https";
import { ServerOptions as Http2ServerOptions } from "http2";
import { ServerOptions as HttpServerOptions } from "http";
import { YowzaServerEvent } from "./module/event";
import { YowzaServerResponse } from "./module/response";
import { Stream } from "stream";
import { YowzaServerError } from "./module/error";

export interface YowzaServerCreateListerOption {
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

export type YowzaServerHandler = (event: YowzaServerEvent) => Promise<YowzaServerEvent | YowzaServerResponse | YowzaServerError>;

export type YowzaServerResponseOption = YowzaServerTextResponseOption | YowzaServerBufferResponseOption | YowzaServerFileReesponseOption;
export interface YowzaServerTextResponseOption {
    type: 'html' | 'json' | 'plain' | 'raw';
    content: string | Stream;
}
export interface YowzaServerBufferResponseOption {
    type: 'buffer';
    content: Buffer;
}
export interface YowzaServerFileReesponseOption {
    type: 'file';
    content: Buffer | Stream;
}