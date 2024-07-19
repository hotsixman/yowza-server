# YowzaServer

A simple web server application for nodejs.

# API

## `class` YowzaServer

```js
import YowzaServer from '@yowza/server';
import testRouter from './routers/test';

const server = new YowzaServer();

server.addRouter(testRouter);

server.listen({
    http: {
        port: 3000
    }
}, () => {console.log("server is listening on port 3000")});
```

- This class creates a server application.

### `method` YowzaServer.addRouter

```ts
const server = new YowzaServer();
server.addRouter(...routers: YowzaServerRouter[]);
```

- This method adds routers for server.
- If there is duplicate route, the last router added will be used.

### `method` YowzaServer.addMiddleware

```ts
const server = new YowzaServer();
server.addMiddleware<T extends YowzaServerHandlerGeneric>(...middlewares: YowzaServerHandler[]);
```

- This method adds middlewares for server.
- middlewares will be called before router handlers

### `method` YowzaServer.listen

```ts
const server = new YowzaServer();
server.listen(option: YowzaServerListenOption, listenCallback?: () => void);

interface YowzaServerListenOption{
    http?: {
        port: number,
        options?: HttpServerOptions //ServerOption from 'node:http'
    },
    http2?: {
        port: number,
        options?: Http2ServerOptions //ServerOption from 'node:http2'
    },
    https?: {
        port: number,
        options?: HttpsServerOptions //ServerOption from 'node:https'
    }
}
```

- This method creates http/http2/https server, and starts listening.
- You can use server options for each server.

## `class` YowzaServerRouter

```ts
import { YowzaServerRouter, YowzaServerResponse, YowzaServerError } from '@yowza/server';

export const testRouter = new YowzaServerRouter('/test');

testRouter.addHandler(async(event) => {
    const keyword = event.request.url.searchParams.get('keyword');

    if(!keyword){
        return new YowzaServerError(400);//Bad Request
    }

    return event;
});

testRouter.addHandler(async(event) => {
    const keyword = event.request.url.searchParams.get('keyword');

    return new YowzaServerResponse({
        type: 'raw',
        content: keyword
    })
}, 'get');
```

- This class creates a router for Yowza server.

### `method` YowzaServerRouter.addHandler

```ts
const router = new YowzaServerRouter('/foo');
router.addHandler<T extends YowzaServerHandlerGeneric>(handler: YowzaServerHandler, httpMethod?: string);
```

- This method adds a handler for its route.
- If you don't write the `httpMethod` parameter, this handler will be used for all http methods and will be called before handlers for specific method(like middleware).
- You can write the `httpMethod` parameter as both upper case and lower case.

### `method` YowzaServerRouter.handle

- Perhaps this method will not be used directly.
- When the server receives a request for such route, this method will be called.
- This method is a function that manages all handlers for this router.

## `class` YowzaServerEvent

```ts
export class YowzaServerEvent {
    request: YowzaServerEventRequest;
    response: YowzaServerEventResponse;
    locals: Record<string, any>;
    params: Record<string, string>;
}
```

### `property` locals `Record<string, any>`

- This property is used to pass some datas between handlers.

### `property` locals `Record<string, params>`

- You can get url parameters through this property when using dynamic route.

### `class` YowzaServerEventRequest
- This class creates an instance which contains informations about the request to the server.

#### `property` header `ReadonlyMap<string, string | readonly string[]>`
- This property contains headers of the request to the server.

#### `property` url `Readonly<URL>`
- This property is an `URL` instance of the request to the server.

#### `property` protocol `'http'|'https'`
- This property is the protocol for a request to the server.

#### `property` method `string`
- This property is a method for a request to the server.

#### `property` cookie `ReadonlyMap<string, string>`
- This property has request cookies

#### `async method` buffer
- This method returns the request buffer.

#### `async method` text
- This method returns the converted string from the request buffer.

#### `async method` json
- This method returns parsed json from the reqeust string.

#### `async method` form `Map<string, string | FormFile>`
- This method returns form data from the reqeust string.

### `class` YowzaServerEventResponse
- This class creates an instance which containes informations about the response from the server.
- If a handler modifies this instance, the next handler will receive the modified instance.

#### `property` header `Map<string, string | number | readonly string[]>`
- This property contains headers of the response from the server.
- Some headers can be overwritten.

#### `property` cookie `YowzaServerResponseCookie`
- This property contains headers of the response from the server.
- The request `Set-Cookie` header will be overwritten.

### `class` YowzaServerResponseCookie

#### `method` set
```ts
set(key: string, value: string, option: YowzaServerResponseCookieOption);
```

#### `method` get
```ts
get(key: string): string | undefined
```

#### `method` delete
```ts
delete(key: string): boolean
```

#### `method` stringify
```ts
stringify(): string[]
```

## `class` YowzaServerResponse

- This class creates an instance which containes data for the response.

### constructor
```ts
constructor(option?: YowzaServerResponseOption);

export type YowzaServerResponseOption = YowzaServerTextResponseOption | YowzaServerBufferResponseOption | YowzaServerFileResponseOption | YowzaServerMediaResponseOption;
export interface YowzaServerTextResponseOption {
    type: 'html' | 'json' | 'plain' | 'raw';
    content: string | ReadStream;
}
export interface YowzaServerBufferResponseOption {
    type: 'buffer';
    content: Buffer;
    mime?: string;
}
export interface YowzaServerFileResponseOption {
    type: 'file';
    content: Buffer | ReadStream | Path;
}
export interface YowzaServerMediaResponseOption {
    type: 'media';
    content: Buffer | Path;
    mime?: string;
}
type Path = string;
```

- It is recommended that you use `'media'` type when sending an audio/video file.

### `method` send

- Perhaps this method will not be used directly.
- When `YowzaServerHandler` returns this instance, the server will call this method which sends a response.

## `class` YowzaServerError

- This class creates an instance which containes data for the error response.

### constructor
```ts
constructor(status: number, option?: YowzaServerResponseOption);
```

### `method` send

- Perhaps this method will not be used directly.
- When `YowzaServerHandler` returns this instance, the server will call this method which sends a error response.

## types

### YowzaServerHandler
```ts
export type YowzaServerHandler<T extends YowzaServerHandlerGeneric> = (event: YowzaServerEvent & T) => Promise<YowzaServerEvent | YowzaServerResponse | YowzaServerError>;
```

### YowzaServerHandlerGeneric

```ts
export interface YowzaServerHandlerGeneric {
    locals?: Record<string, any>;
    params?: Readonly<Params>
}
```

### FormFile

```ts
export interface FormFile{
    filename?: string;
    mime?: string;
    encoding?: string;
    transfer?: string;
    content: Buffer
}
```

### YowzaServerCookieOption
```ts
export interface YowzaServerResponseCookieOption{
    path: string;
    domain?: string;
    expires?: number | Date;
    httpOnly?: boolean;
    maxAge?: number;
    secure?: boolean;
    partitioned?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}
```