/// <reference types="node" />
import { Http2ServerResponse } from "http2";
import { YowzaServerResponseOption } from "../types";
import { YowzaServerEvent } from "./event";
import { YowzaServerResponse } from "./response";
export declare class YowzaServerError extends YowzaServerResponse {
    readonly statusCode: number;
    readonly defaultErrorBody: Map<number, string>;
    constructor(statusCode: number, option?: YowzaServerResponseOption);
    send(res: Http2ServerResponse, event: YowzaServerEvent): Promise<void>;
    sendEmpty(statusCode: number, res: Http2ServerResponse): void;
}
//# sourceMappingURL=error.d.ts.map