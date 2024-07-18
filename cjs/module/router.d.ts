import { YowzaServerHandler, YowzaServerHandlerGeneric } from "../types";
export declare class YowzaServerRouter {
    static sequence(...handlers: YowzaServerHandler[]): YowzaServerHandler;
    route: string;
    ALL: YowzaServerHandler<any>[];
    methodHandlers: Map<string, YowzaServerHandler<any>[]>;
    constructor(route: string);
    addHandler<T extends YowzaServerHandlerGeneric>(handler: YowzaServerHandler<T>, method?: string): void;
    handle: YowzaServerHandler;
}
//# sourceMappingURL=router.d.ts.map