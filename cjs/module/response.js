"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YowzaServerResponse = void 0;
const fs_1 = require("fs");
const mime_types_1 = __importDefault(require("mime-types"));
const path_1 = __importDefault(require("path"));
class YowzaServerResponse {
    static fileTypeMime;
    static async getFileTypeMime() {
        if (this.fileTypeMime === undefined) {
            this.fileTypeMime = await import('file-type-mime');
        }
        return this.fileTypeMime;
    }
    static StreamFileType;
    static async getStreamFileType() {
        if (this.StreamFileType === undefined) {
            this.StreamFileType = (await import('stream-file-type')).default;
        }
        return this.StreamFileType;
    }
    option = {
        type: 'empty'
    };
    constructor(option) {
        if (option) {
            this.option = option;
        }
    }
    async send(res, event) {
        if (res.setDefaultEncoding)
            res.setDefaultEncoding('utf-8');
        res.statusCode = 200;
        Array.from(event.response.header.entries()).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
        const cookieString = event.response.cookie.stringify();
        res.setHeader('Set-Cookie', cookieString);
        await this.sendSwitch(res, event);
    }
    async sendSwitch(res, event) {
        switch (this.option.type) {
            case ('empty'): {
                res.setHeader('Content-Type', 'text/plain; charset=utf8');
                res.end();
                break;
            }
            case ('html'): {
                res.setHeader('Content-Type', 'text/html; charset=utf8');
                if (this.option.content instanceof fs_1.ReadStream) {
                    this.option.content.pipe(res);
                }
                else {
                    res.end(this.option.content);
                }
                break;
            }
            case ('json'): {
                res.setHeader('Content-Type', 'application/json; charset=utf8');
                if (this.option.content instanceof fs_1.ReadStream) {
                    this.option.content.pipe(res);
                }
                else {
                    res.end(this.option.content);
                }
                break;
            }
            case ('plain'): {
                res.setHeader('Content-Type', 'text/plain; charset=utf8');
                if (this.option.content instanceof fs_1.ReadStream) {
                    this.option.content.pipe(res);
                }
                else {
                    res.end(this.option.content);
                }
                break;
            }
            case ('raw'): {
                res.setHeader('Content-Type', 'text/plain; charset=utf8');
                if (this.option.content instanceof fs_1.ReadStream) {
                    this.option.content.pipe(res);
                }
                else {
                    res.end(this.option.content);
                }
                break;
            }
            case ('file'): {
                if (this.option.content instanceof fs_1.ReadStream) {
                    res.setHeader('Accept-Ranges', 'bytes');
                    const StreamFileType = await YowzaServerResponse.getStreamFileType();
                    const detector = new StreamFileType();
                    detector.on('file-type', (fileType) => {
                        if (fileType !== null) {
                            try {
                                res.setHeader('Content-Type', fileType.mime + '; charset=utf8');
                            }
                            catch { }
                        }
                    });
                    const content = this.option.content;
                    content.pipe(detector).pipe(res);
                }
                else if (this.option.content instanceof Buffer) {
                    res.setHeader('Accept-Ranges', 'bytes');
                    const fileTypeMime = await YowzaServerResponse.getFileTypeMime();
                    const result = fileTypeMime.parse(this.option.content);
                    if (result) {
                        res.setHeader('Content-Type', result.mime + '; charset=utf8');
                    }
                    res.setHeader('Content-Length', this.option.content.byteLength);
                    res.end(this.option.content);
                }
                else {
                    const filePath = this.option.content;
                    const stats = (0, fs_1.statSync)(filePath);
                    const range = event.request.header.get('range');
                    const fileSize = stats.size;
                    const chunkSize = 1024 ** 2;
                    const start = range ? Number(range.replace(/\D/g, "")) : 1;
                    const end = Math.min(start + chunkSize, fileSize - 1);
                    res.setHeader('Content-Length', end - start);
                    res.setHeader('Content-Range', "bytes " + start + "-" + end + "/" + fileSize);
                    res.setHeader('Accept-Ranges', "bytes");
                    res.statusCode = 206;
                    const StreamFileType = await YowzaServerResponse.getStreamFileType();
                    const detector = new StreamFileType();
                    const stream = (0, fs_1.createReadStream)(filePath, { start, end });
                    stream.pipe(detector).pipe(res);
                }
                break;
            }
            case ('media'): {
                if (this.option.content instanceof Buffer) {
                    res.setHeader('Accept-Ranges', 'bytes');
                    res.setHeader('Content-Length', this.option.content.byteLength);
                    const fileTypeMime = await YowzaServerResponse.getFileTypeMime();
                    const result = fileTypeMime.parse(this.option.content);
                    if (this.option.mime) {
                        res.setHeader('Content-Type', this.option.mime + '; charset=utf8');
                    }
                    else if (result) {
                        res.setHeader('Content-Type', result.mime + '; charset=utf8');
                    }
                    res.end(this.option.content);
                }
                else {
                    const filePath = this.option.content;
                    const stats = (0, fs_1.statSync)(filePath);
                    const range = event.request.header.get('range');
                    const fileSize = stats.size;
                    const chunkSize = 1024 ** 2;
                    const start = range ? Number(range.replace(/\D/g, "")) : 1;
                    const end = Math.min(start + chunkSize, fileSize - 1);
                    res.setHeader('Content-Length', end - start);
                    res.setHeader('Content-Range', "bytes " + start + "-" + end + "/" + fileSize);
                    res.setHeader('Accept-Ranges', "bytes");
                    res.setHeader('Content-Type', (this.option.mime ?? (mime_types_1.default.lookup(path_1.default.extname(filePath)) || 'video/mp4')) + '; charset=utf8');
                    res.statusCode = 206;
                    const stream = (0, fs_1.createReadStream)(filePath, { start, end });
                    stream.pipe(res);
                }
                break;
            }
            case ('buffer'): {
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('Content-Length', this.option.content.byteLength);
                const fileTypeMime = await YowzaServerResponse.getFileTypeMime();
                const result = fileTypeMime.parse(this.option.content);
                if (this.option.mime) {
                    res.setHeader('Content-Type', this.option.mime + '; charset=utf8');
                }
                else if (result) {
                    res.setHeader('Content-Type', result.mime + '; charset=utf8');
                }
                res.end(this.option.content);
            }
        }
    }
}
exports.YowzaServerResponse = YowzaServerResponse;
//# sourceMappingURL=response.js.map