import { YowzaServerHandler, YowzaServerHandlerGeneric, YowzaServerListenOption } from "./types";
import { YowzaServerEvent } from "./module/event.js";
import { YowzaServerRouter } from "./module/router.js";
import { YowzaServerError } from "./module/error.js";
import { YowzaServerResponse } from "./module/response.js";
export default class YowzaServer {
    private routers;
    private middlewares;
    addRouter(...routers: YowzaServerRouter[]): void;
    addMiddleware<T extends YowzaServerHandlerGeneric>(...middlewares: YowzaServerHandler<T>[]): void;
    private createListener;
    listen(option: YowzaServerListenOption, listenCallback?: () => void): void;
}
export { YowzaServerRouter, YowzaServerResponse, YowzaServerError, YowzaServerEvent };
//# sourceMappingURL=index.d.ts.map