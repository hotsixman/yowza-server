import { YowzaServerHandler } from "../types";
export declare class YowzaServerRouter {
    static sequence(...handlers: YowzaServerHandler[]): YowzaServerHandler;
    route: string;
    ALL: YowzaServerHandler[];
    methodHandlers: Map<string, YowzaServerHandler[]>;
    constructor(route: string);
    addHandler(handler: YowzaServerHandler, method?: string): void;
    handle: YowzaServerHandler;
}
//# sourceMappingURL=router.d.ts.map