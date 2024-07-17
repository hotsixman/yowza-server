import { pathToRegexp, parse } from "path-to-regexp";
import { YowzaServerCreateListerOption, YowzaServerHandler, YowzaServerListenOption } from "./types";
import { createServer as createHttpServer } from "http";
import { createServer as createHttp2Server, Http2ServerRequest, Http2ServerResponse } from "http2";
import { createServer as createHttpsServer } from "https";
import { YowzaServerEvent } from "./module/event";
import { YowzaServerRouter } from "./module/router";
import { YowzaServerError } from "./module/error";
import { YowzaServerResponse } from "./module/response";

export default class YowzaServer {
    private routers: Map<string, YowzaServerRouter> = new Map();
    private middlewares: YowzaServerHandler[] = [];

    addRouter(...routers: YowzaServerRouter[]) {
        routers.forEach(router => {
            this.routers.set(router.route, router);
        })
    }

    private createListener(option: YowzaServerCreateListerOption): (request: Http2ServerRequest, response: Http2ServerResponse) => void {
        const routesStringSet: Set<string> = new Set();
        const routesRegExpMap: Map<string, RegExp> = new Map();

        Array.from(this.routers.keys()).forEach((route) => {
            const tokenData = parse(route);
            if (tokenData.tokens.length === 1) {
                routesStringSet.add(route);
            }
            else {
                routesRegExpMap.set(route, pathToRegexp(route));
            }
        })

        return async (req, res) => {
            const event = new YowzaServerEvent(req, option);

            //route
            for (const route of routesStringSet) {
                if (event.request.url.pathname !== route) {
                    continue;
                }

                const router = this.routers.get(route);
                if (!router) {
                    break;
                }

                const handled = await router.handle(event);
                if (handled instanceof YowzaServerEvent) {
                    new YowzaServerError(500).send(res, event);
                }
                else {
                    handled.send(res, event);
                }
                return;
            }

            //dynamic route
            for (const [route, routeRegExp] of routesRegExpMap) {
                if (!routeRegExp.test(event.request.url.pathname)) {
                    continue;
                }

                const router = this.routers.get(route);
                if (!router) {
                    break;
                }

                const handled = await router.handle(event);
                if (handled instanceof YowzaServerEvent) {
                    new YowzaServerError(500).send(res, event);
                }
                else {
                    handled.send(res, event);
                }
                return;
            }

            new YowzaServerError(404).send(res, event);
        }
    }

    listen(option: YowzaServerListenOption, listenCallback?: () => void) {
        const { http, http2, https } = option;

        if (http) {
            const httpServer = createHttpServer(http.options ?? {});
            httpServer.on('request', this.createListener({ protocol: 'http' }));
            httpServer.listen(http.port);
        }
        if (http2) {
            const http2Server = createHttp2Server(http2.options ?? {});
            http2Server.on('request', this.createListener({ protocol: 'http' }));
            http2Server.listen(http2.port);
        }
        if (https) {
            const httpsServer = createHttpsServer(https.options ?? {});
            httpsServer.on('request', this.createListener({ protocol: 'https' }));
            httpsServer.listen(https.port)
        }

        if (listenCallback) {
            listenCallback();
        }
    }
}

export {
    YowzaServerRouter,
    YowzaServerResponse,
    YowzaServerError
}