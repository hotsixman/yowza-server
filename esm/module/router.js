import { YowzaServerError } from "./error";
import { YowzaServerEvent } from "./event";
export class YowzaServerRouter {
    static sequence(...handlers) {
        return async (event) => {
            for (const handler of handlers) {
                const handled = await handler(event);
                if (handled instanceof YowzaServerEvent) {
                    continue;
                }
                else {
                    return handled;
                }
            }
            return event;
        };
    }
    route;
    ALL = [];
    methodHandlers = new Map();
    constructor(route) {
        this.route = route;
    }
    addHandler(handler, method) {
        if (method) {
            method = method.toUpperCase();
            let handlers = this.methodHandlers.get(method);
            if (handlers === undefined) {
                handlers = [];
                this.methodHandlers.set(method, handlers);
            }
            handlers.push(handler);
        }
        else {
            this.ALL.push(handler);
        }
    }
    handle = async (event) => {
        const allHandlerSequence = YowzaServerRouter.sequence(...this.ALL);
        const result = await allHandlerSequence(event);
        if (!(result instanceof YowzaServerEvent)) {
            return result;
        }
        for (const method of this.methodHandlers.keys()) {
            if (event.request.method.toUpperCase() === method) {
                const handlers = this.methodHandlers.get(method);
                if (handlers === undefined) {
                    continue;
                }
                const handlerSequence = YowzaServerRouter.sequence(...handlers);
                return await handlerSequence(event);
            }
        }
        return new YowzaServerError(405);
    };
}
//# sourceMappingURL=router.js.map