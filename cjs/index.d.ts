import { YowzaServerListenOption } from "./types";
import { YowzaServerRouter } from "./module/router";
import { YowzaServerError } from "./module/error";
import { YowzaServerResponse } from "./module/response";
export default class YowzaServer {
    private routers;
    private middlewares;
    addRouter(...routers: YowzaServerRouter[]): void;
    private createListener;
    listen(option: YowzaServerListenOption, listenCallback?: () => void): void;
}
export { YowzaServerRouter, YowzaServerResponse, YowzaServerError };
//# sourceMappingURL=index.d.ts.map