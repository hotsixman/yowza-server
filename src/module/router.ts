import { YowzaServerHandler } from "../types";
import { YowzaServerError } from "./error";
import { YowzaServerEvent } from "./event";

export class YowzaServerRouter {
    static sequence(...handlers: YowzaServerHandler[]): YowzaServerHandler {
        return async (event: YowzaServerEvent) => {
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
        }
    }

    route: string;
    ALL: YowzaServerHandler[] = [];
    methodHandlers: Map<string, YowzaServerHandler[]> = new Map();

    constructor(route: string) {
        this.route = route;
    }

    addHandler(handler: YowzaServerHandler, method?: string) {
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

    handle: YowzaServerHandler = async (event) => {
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
    }
}