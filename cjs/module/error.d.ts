/// <reference types="node" />
import { Http2ServerResponse } from "http2";
import { YowzaServerResponseOption } from "../types";
import { YowzaServerEvent } from "./event";
export declare class YowzaServerError {
    readonly statusCode: number;
    readonly type: YowzaServerResponseOption['type'] | 'empty';
    readonly content: YowzaServerResponseOption['content'];
    readonly defaultErrorBody: Map<number, string>;
    constructor(statusCode: number, option?: YowzaServerResponseOption);
    send(res: Http2ServerResponse, event: YowzaServerEvent): void;
    sendEmpty(statusCode: number, res: Http2ServerResponse): void;
}
//# sourceMappingURL=error.d.ts.map