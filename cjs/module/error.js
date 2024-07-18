"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YowzaServerError = void 0;
const response_1 = require("./response");
class YowzaServerError extends response_1.YowzaServerResponse {
    statusCode;
    defaultErrorBody = new Map([
        [400, '<h1>400 Bad Request</h1>'],
        [404, '<h1>404 Not Found</h1>'],
        [405, '<h1>405 Method Not Allowed</h1>']
    ]);
    constructor(statusCode, option) {
        super(option);
        this.statusCode = statusCode;
    }
    async send(res, event) {
        if (res.setDefaultEncoding)
            res.setDefaultEncoding('utf-8');
        res.statusCode = this.statusCode;
        if (this.option.type === 'empty') {
            this.sendEmpty(this.statusCode, res);
            return;
        }
        await this.sendSwitch(res, event);
    }
    sendEmpty(statusCode, res) {
        res.setHeader('Content-Type', 'text/html');
        res.end(this.defaultErrorBody.get(statusCode) ?? `<h1>${statusCode} Error</h1>`);
    }
}
exports.YowzaServerError = YowzaServerError;
//# sourceMappingURL=error.js.map