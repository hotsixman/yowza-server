"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YowzaServerEvent = exports.YowzaServerError = exports.YowzaServerResponse = exports.YowzaServerRouter = void 0;
const path_to_regexp_1 = require("path-to-regexp");
const http_1 = require("http");
const http2_1 = require("http2");
const https_1 = require("https");
const event_js_1 = require("./module/event.js");
Object.defineProperty(exports, "YowzaServerEvent", { enumerable: true, get: function () { return event_js_1.YowzaServerEvent; } });
const router_js_1 = require("./module/router.js");
Object.defineProperty(exports, "YowzaServerRouter", { enumerable: true, get: function () { return router_js_1.YowzaServerRouter; } });
const error_js_1 = require("./module/error.js");
Object.defineProperty(exports, "YowzaServerError", { enumerable: true, get: function () { return error_js_1.YowzaServerError; } });
const response_js_1 = require("./module/response.js");
Object.defineProperty(exports, "YowzaServerResponse", { enumerable: true, get: function () { return response_js_1.YowzaServerResponse; } });
class YowzaServer {
    routers = new Map();
    middlewares = [];
    addRouter(...routers) {
        routers.forEach(router => {
            this.routers.set(router.route, router);
        });
    }
    addMiddleware(...middlewares) {
        this.middlewares.push(...middlewares);
    }
    createListener(option) {
        const routesStringSet = new Set();
        const routesRegExpMap = new Map();
        Array.from(this.routers.keys()).forEach((route) => {
            const tokenData = (0, path_to_regexp_1.parse)(route);
            if (tokenData.tokens.length === 1) {
                routesStringSet.add(route);
            }
            else {
                routesRegExpMap.set(route, (0, path_to_regexp_1.pathToRegexp)(route));
            }
        });
        return async (req, res) => {
            const event = new event_js_1.YowzaServerEvent(req, option);
            const middlewareHandled = (router_js_1.YowzaServerRouter.sequence(...this.middlewares))(event);
            if (middlewareHandled instanceof response_js_1.YowzaServerResponse) {
                return await middlewareHandled.send(res, event);
            }
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
                    if (handled instanceof event_js_1.YowzaServerEvent) {
                        return await new error_js_1.YowzaServerError(500).send(res, event);
                    }
                    else {
                        return await handled.send(res, event);
                    }
                }
                catch (err) {
                    console.warn(`Error occured at ${route}`);
                    console.warn(err);
                    return await new error_js_1.YowzaServerError(500).send(res, event);
                }
            }
            for (const [route, routeRegExp] of routesRegExpMap) {
                if (!routeRegExp.test(event.request.url.pathname)) {
                    continue;
                }
                event.params = ((0, path_to_regexp_1.match)(route)(event.request.url.pathname)).params;
                const router = this.routers.get(route);
                if (!router) {
                    break;
                }
                try {
                    const handled = await router.handle(event);
                    if (handled instanceof event_js_1.YowzaServerEvent) {
                        return await new error_js_1.YowzaServerError(500).send(res, event);
                    }
                    else {
                        return await handled.send(res, event);
                    }
                }
                catch (err) {
                    console.warn(`Error occured at ${route}`);
                    console.warn(err);
                    return await new error_js_1.YowzaServerError(500).send(res, event);
                }
            }
            return await new error_js_1.YowzaServerError(404).send(res, event);
        };
    }
    listen(option, listenCallback) {
        const { http, http2, https } = option;
        if (http) {
            const httpServer = (0, http_1.createServer)(http.options ?? {});
            httpServer.on('request', this.createListener({ protocol: 'http' }));
            httpServer.listen(http.port);
        }
        if (http2) {
            const http2Server = (0, http2_1.createServer)(http2.options ?? {});
            http2Server.on('request', this.createListener({ protocol: 'http' }));
            http2Server.listen(http2.port);
        }
        if (https) {
            const httpsServer = (0, https_1.createServer)(https.options ?? {});
            httpsServer.on('request', this.createListener({ protocol: 'https' }));
            httpsServer.listen(https.port);
        }
        if (listenCallback) {
            listenCallback();
        }
    }
}
exports.default = YowzaServer;
//# sourceMappingURL=index.js.map