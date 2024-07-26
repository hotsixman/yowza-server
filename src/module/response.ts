import { Http2ServerResponse } from "http2";
import { YowzaServerResponseOption } from "../types";
import { YowzaServerEvent } from "./event.js";
import { createReadStream, ReadStream, statSync } from "fs";
import mime from 'mime-types';
import path from "path";

export class YowzaServerResponse {
    private static fileTypeMime: typeof import('file-type-mime', { with: { "resolution-mode": "import" }});
    static async getFileTypeMime() {
        if (this.fileTypeMime === undefined) {
            this.fileTypeMime = await import('file-type-mime');
        }

        return this.fileTypeMime;
    }
    private static StreamFileType: (typeof import('stream-file-type', { with: { "resolution-mode": "import" }}))['default'];
    static async getStreamFileType() {
        if (this.StreamFileType === undefined) {
            this.StreamFileType = (await import('stream-file-type')).default;
        }

        return this.StreamFileType;
    }

    option: YowzaServerResponseOption | { type: 'empty' } = {
        type: 'empty'
    }

    constructor(option?: YowzaServerResponseOption) {
        if (option) {
            this.option = option;
        }
    }

    async send(res: Http2ServerResponse, event: YowzaServerEvent) {
        if (res.setDefaultEncoding) res.setDefaultEncoding('utf-8');
        res.statusCode = 200;

        //header
        Array.from(event.response.header.entries()).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        //cookie
        const cookieString = event.response.cookie.stringify();
        res.setHeader('Set-Cookie', cookieString);


        await this.sendSwitch(res, event);
    }

    async sendSwitch(res: Http2ServerResponse, event: YowzaServerEvent) {
        switch (this.option.type) {
            case ('empty'): {
                res.setHeader('Content-Type', 'text/plain; charset=utf8');

                res.end();

                break;
            }
            case ('html'): {
                res.setHeader('Content-Type', 'text/html; charset=utf8');
                if (this.option.content instanceof ReadStream) {
                    this.option.content.pipe(res);
                }
                else {
                    res.end(this.option.content);
                }

                break;
            }
            case ('json'): {
                res.setHeader('Content-Type', 'application/json; charset=utf8');
                if (this.option.content instanceof ReadStream) {
                    this.option.content.pipe(res);
                }
                else {
                    res.end(this.option.content);
                }

                break;
            }
            case ('plain'): {
                res.setHeader('Content-Type', 'text/plain; charset=utf8');
                if (this.option.content instanceof ReadStream) {
                    this.option.content.pipe(res);
                }
                else {
                    res.end(this.option.content);
                }

                break;
            }
            case ('raw'): {
                res.setHeader('Content-Type', 'text/plain; charset=utf8');
                if (this.option.content instanceof ReadStream) {
                    this.option.content.pipe(res);
                }
                else {
                    res.end(this.option.content);
                }

                break;
            }
            case ('file'): {
                if (this.option.content instanceof ReadStream) {
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
                else { //path
                    const filePath = this.option.content as string;
                    const stats = statSync(filePath);

                    res.setHeader('Content-Length', stats.size);
                    res.setHeader('Accept-Ranges', "bytes");

                    const StreamFileType = await YowzaServerResponse.getStreamFileType();
                    const detector = new StreamFileType();

                    const stream = createReadStream(filePath);

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
                    const filePath = this.option.content as string;
                    const stats = statSync(filePath);

                    const range = event.request.header.get('range');
                    const fileSize = stats.size;
                    const chunkSize = 1024 ** 2;
                    const start = range ? Number(range.replace(/\D/g, "")) : 1;
                    const end = Math.min(start + chunkSize, fileSize - 1);

                    res.setHeader('Content-Length', end - start);
                    res.setHeader('Content-Range', "bytes " + start + "-" + end + "/" + fileSize);
                    res.setHeader('Accept-Ranges', "bytes");
                    res.setHeader('Content-Type', (this.option.mime ?? (mime.lookup(path.extname(filePath)) || 'video/mp4')) + '; charset=utf8');
                    res.statusCode = 206;

                    const stream = createReadStream(filePath, { start, end });

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