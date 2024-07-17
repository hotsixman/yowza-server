import { Http2ServerResponse } from "http2";
import { YowzaServerResponseOption } from "../types";
import { Stream } from "stream";
import { YowzaServerEvent } from "./event";

export class YowzaServerError {
    readonly statusCode: number;
    readonly type: YowzaServerResponseOption['type'] | 'empty';
    readonly content: YowzaServerResponseOption['content'];
    readonly defaultErrorBody: Map<number, string> = new Map([
        [400, '<h1>400 Bad Request</h1>'],
        [404, '<h1>404 Not Found</h1>'],
        [405, '<h1>405 Method Not Allowed</h1>']
    ]);


    constructor(statusCode: number, option?: YowzaServerResponseOption) {
        this.statusCode = statusCode;
        if (option) {
            this.type = option.type;
            this.content = option.content;
        }
        else {
            this.type = 'empty';
            this.content = '';
        }
    }

    send(res: Http2ServerResponse, event: YowzaServerEvent) {
        if(res.setDefaultEncoding) res.setDefaultEncoding('utf-8');
        res.statusCode = this.statusCode;

        switch (this.type) {
            case ('empty'): {
                this.sendEmpty(this.statusCode, res);

                break;
            }
            case ('html'): {
                res.setHeader('Content-Type', 'text/html');
                if (this.content instanceof Stream) {
                    this.content.pipe(res);
                }
                else {
                    res.end(this.content);
                }

                break;
            }
            case ('json'): {
                res.setHeader('Content-Type', 'application/json');
                if (this.content instanceof Stream) {
                    this.content.pipe(res);
                }
                else {
                    res.end(this.content);
                }

                break;
            }
            case ('plain'): {
                res.setHeader('Content-Type', 'text/plain');
                if (this.content instanceof Stream) {
                    this.content.pipe(res);
                }
                else {
                    res.end(this.content);
                }

                break;
            }
            case ('raw'): {
                res.setHeader('Content-Type', 'text/plain');
                if (this.content instanceof Stream) {
                    this.content.pipe(res);
                }
                else {
                    res.end(this.content);
                }

                break;
            }
        }
    }

    sendEmpty(statusCode: number, res: Http2ServerResponse) {
        res.setHeader('Content-Type', 'text/html');
        res.end(this.defaultErrorBody.get(statusCode) ?? `<h1>${statusCode} Error</h1>`);
    }
}