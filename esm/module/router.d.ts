import { YowzaServerHandler, YowzaServerHandlerGeneric } from "../types";
export declare class YowzaServerRouter {
    static sequence(...handlers: YowzaServerHandler[]): YowzaServerHandler;
    route: string;
    private ALL;
    private methodHandlers;
    constructor(route: string);
    addHandler<T extends YowzaServerHandlerGeneric>(handler: YowzaServerHandler<T>, method?: string): void;
    handle: YowzaServerHandler;
}
//# sourceMappingURL=router.d.ts.map