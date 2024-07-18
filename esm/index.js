import { pathToRegexp, parse } from "path-to-regexp";
import { createServer as createHttpServer } from "http";
import { createServer as createHttp2Server } from "http2";
import { createServer as createHttpsServer } from "https";
import { YowzaServerEvent } from "./module/event";
import { YowzaServerRouter } from "./module/router";
import { YowzaServerError } from "./module/error";
import { YowzaServerResponse } from "./module/response";
export default class YowzaServer {
    routers = new Map();
    middlewares = [];
    addRouter(...routers) {
        routers.forEach(router => {
            this.routers.set(router.route, router);
        });
    }
    createListener(option) {
        const routesStringSet = new Set();
        const routesRegExpMap = new Map();
        Array.from(this.routers.keys()).forEach((route) => {
            const tokenData = parse(route);
            if (tokenData.tokens.length === 1) {
                routesStringSet.add(route);
            }
            else {
                routesRegExpMap.set(route, pathToRegexp(route));
            }
        });
        return async (req, res) => {
            const event = new YowzaServerEvent(req, option);
            for (const route of routesStringSet) {
                if (event.request.url.pathname !== route) {
                    continue;
                }
                const router = this.routers.get(route);
                if (!router) {
                    break;
                }
                try {
                    const handled = await router.handle(event);
                    if (handled instanceof YowzaServerEvent) {
                        await new YowzaServerError(500).send(res, event);
                    }
                    else {
                        await handled.send(res, event);
                    }
                    return;
                }
                catch (err) {
                    console.warn(`Error occured at ${route}`);
                    console.warn(err);
                    return await new YowzaServerError(500).send(res, event);
                }
            }
            for (const [route, routeRegExp] of routesRegExpMap) {
                if (!routeRegExp.test(event.request.url.pathname)) {
                    continue;
                }
                const router = this.routers.get(route);
                if (!router) {
                    break;
                }
                try {
                    const handled = await router.handle(event);
                    if (handled instanceof YowzaServerEvent) {
                        await new YowzaServerError(500).send(res, event);
                    }
                    else {
                        await handled.send(res, event);
                    }
                    return;
                }
                catch (err) {
                    console.warn(`Error occured at ${route}`);
                    console.warn(err);
                    return await new YowzaServerError(500).send(res, event);
                }
            }
            return await new YowzaServerError(404).send(res, event);
        };
    }
    listen(option, listenCallback) {
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
            httpsServer.listen(https.port);
        }
        if (listenCallback) {
            listenCallback();
        }
    }
}
export { YowzaServerRouter, YowzaServerResponse, YowzaServerError };
//# sourceMappingURL=index.js.map