"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YowzaServerResponse = void 0;
const stream_1 = require("stream");
class YowzaServerResponse {
    type;
    content;
    constructor(option) {
        if (option) {
            this.type = option.type;
            this.content = option.content;
        }
        else {
            this.type = 'empty';
            this.content = '';
        }
    }
    send(res, event) {
        if (res.setDefaultEncoding)
            res.setDefaultEncoding('utf-8');
        res.statusCode = 200;
        Array.from(event.response.header.entries()).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
        switch (this.type) {
            case ('empty'): {
                res.setHeader('Content-Type', 'text/plain');
                res.end();
                break;
            }
            case ('html'): {
                res.setHeader('Content-Type', 'text/html');
                if (this.content instanceof stream_1.Stream) {
                    this.content.pipe(res);
                }
                else {
                    res.end(this.content);
                }
                break;
            }
            case ('json'): {
                res.setHeader('Content-Type', 'application/json');
                if (this.content instanceof stream_1.Stream) {
                    this.content.pipe(res);
                }
                else {
                    res.end(this.content);
                }
                break;
            }
            case ('plain'): {
                res.setHeader('Content-Type', 'text/plain');
                if (this.content instanceof stream_1.Stream) {
                    this.content.pipe(res);
                }
                else {
                    res.end(this.content);
                }
                break;
            }
            case ('raw'): {
                res.setHeader('Content-Type', 'text/plain');
                if (this.content instanceof stream_1.Stream) {
                    this.content.pipe(res);
                }
                else {
                    res.end(this.content);
                }
                break;
            }
        }
    }
}
exports.YowzaServerResponse = YowzaServerResponse;
//# sourceMappingURL=response.js.map