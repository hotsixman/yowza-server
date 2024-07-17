"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YowzaServerRouter = void 0;
const error_1 = require("./error");
const event_1 = require("./event");
class YowzaServerRouter {
    static sequence(...handlers) {
        return async (event) => {
            for (const handler of handlers) {
                const handled = await handler(event);
                if (handled instanceof event_1.YowzaServerEvent) {
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
        if (!(result instanceof event_1.YowzaServerEvent)) {
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
        return new error_1.YowzaServerError(405);
    };
}
exports.YowzaServerRouter = YowzaServerRouter;
//# sourceMappingURL=router.js.map