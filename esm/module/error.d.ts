/// <reference types="node" />
import { Http2ServerResponse } from "http2";
import { YowzaServerResponseOption } from "../types";
import { YowzaServerEvent } from "./event.js";
import { YowzaServerResponse } from "./response.js";
export declare class YowzaServerError extends YowzaServerResponse {
    readonly statusCode: number;
    readonly defaultErrorBody: Map<number, string>;
    constructor(statusCode: number, option?: YowzaServerResponseOption);
    send(res: Http2ServerResponse, event: YowzaServerEvent): Promise<void>;
    sendEmpty(statusCode: number, res: Http2ServerResponse): void;
}
//# sourceMappingURL=error.d.ts.map