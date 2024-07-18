import { Http2ServerResponse } from "http2";
import { YowzaServerResponseOption } from "../types";
import { YowzaServerEvent } from "./event";
import { YowzaServerResponse } from "./response";

export class YowzaServerError extends YowzaServerResponse {
    readonly statusCode: number;
    readonly defaultErrorBody: Map<number, string> = new Map([
        [400, '<h1>400 Bad Request</h1>'],
        [404, '<h1>404 Not Found</h1>'],
        [405, '<h1>405 Method Not Allowed</h1>']
    ]);


    constructor(statusCode: number, option?: YowzaServerResponseOption) {
        super(option);
        this.statusCode = statusCode;
    }

    async send(res: Http2ServerResponse, event: YowzaServerEvent) {
        if (res.setDefaultEncoding) res.setDefaultEncoding('utf-8');
        res.statusCode = this.statusCode;

        if (this.option.type === 'empty') {
            this.sendEmpty(this.statusCode, res);
            return;
        }

        await this.sendSwitch(res, event);
    }

    sendEmpty(statusCode: number, res: Http2ServerResponse) {
        res.setHeader('Content-Type', 'text/html');
        res.end(this.defaultErrorBody.get(statusCode) ?? `<h1>${statusCode} Error</h1>`);
    }
}