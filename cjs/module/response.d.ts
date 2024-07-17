/// <reference types="node" />
import { Http2ServerResponse } from "http2";
import { YowzaServerResponseOption } from "../types";
import { YowzaServerEvent } from "./event";
export declare class YowzaServerResponse {
    type: YowzaServerResponseOption['type'] | 'empty';
    content: YowzaServerResponseOption['content'];
    constructor(option?: YowzaServerResponseOption);
    send(res: Http2ServerResponse, event: YowzaServerEvent): void;
}
//# sourceMappingURL=response.d.ts.map