/// <reference types="node" />
import { Http2ServerResponse } from "http2";
import { YowzaServerResponseOption } from "../types";
import { YowzaServerEvent } from "./event";
export declare class YowzaServerResponse {
    private static fileTypeMime;
    static getFileTypeMime(): Promise<typeof import("file-type-mime", { with: { "resolution-mode": "import" } })>;
    private static StreamFileType;
    static getStreamFileType(): Promise<typeof import("stream-file-type", { with: { "resolution-mode": "import" } }).default>;
    option: YowzaServerResponseOption | {
        type: 'empty';
    };
    constructor(option?: YowzaServerResponseOption);
    send(res: Http2ServerResponse, event: YowzaServerEvent): Promise<void>;
    sendSwitch(res: Http2ServerResponse, event: YowzaServerEvent): Promise<void>;
}
//# sourceMappingURL=response.d.ts.map