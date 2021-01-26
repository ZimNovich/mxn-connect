# mxn-connect

**mxn-connect** is a fork of [**connect**](https://github.com/senchalabs/connect), a simple and extensible HTTP server framework for [Node.js](http://nodejs.org) using "plugins" known as **middleware**.

The core of **mxn-connect** is "using" **middleware**. Middleware are added as a "stack" where incoming requests will execute each middleware one-by-one until a middleware does not call `next()` within it.

## Install

```
$ npm install mxn-connect
```

## Usage

Use it like this in your rollup.config:

```js
// HTTP / HTTPS servers
const http  = require("http");
const https = require("https");

// MXN Connect Framework
const connect = require("mxn-connect");

// Instantiating the App
const app = connect();

// Adding Middleware
const logging = require("mxn-logger");
const favicon = require("mxn-favicons");
const sstatic = require("serve-static");

app.use(logging);
app.use(favicon(__dirname + "/public/icons"));
app.use(sstatic(__dirname + "/public"));

// Respond to all requests
app.use(function(req, res) {
    res.end("Hello from MXN Connect!\n");
});

// Create node.js http server and listen on port
const options = { };
const server = http.createServer(options, app)
                   .listen(3000, function()
{
    console.log("Server is running on port 3000");
});

server.on("error" , function(error) {
    console.error("Error event handler called: " + error);
});
```

## Connect/Express Middleware

These middleware and libraries are officially supported by the Connect/Express team:

  - [body-parser](https://www.npmjs.com/package/body-parser) - previous `bodyParser`, `json`, and `urlencoded`. You may also be interested in:
    - [body](https://www.npmjs.com/package/body)
    - [co-body](https://www.npmjs.com/package/co-body)
    - [raw-body](https://www.npmjs.com/package/raw-body)
  - [compression](https://www.npmjs.com/package/compression) - previously `compress`
  - [connect-timeout](https://www.npmjs.com/package/connect-timeout) - previously `timeout`
  - [cookie-parser](https://www.npmjs.com/package/cookie-parser) - previously `cookieParser`
  - [cookie-session](https://www.npmjs.com/package/cookie-session) - previously `cookieSession`
  - [csurf](https://www.npmjs.com/package/csurf) - previously `csrf`
  - [errorhandler](https://www.npmjs.com/package/errorhandler) - previously `error-handler`
  - [express-session](https://www.npmjs.com/package/express-session) - previously `session`
  - [method-override](https://www.npmjs.com/package/method-override) - previously `method-override`
  - [morgan](https://www.npmjs.com/package/morgan) - previously `logger`
  - [response-time](https://www.npmjs.com/package/response-time) - previously `response-time`
  - [serve-favicon](https://www.npmjs.com/package/serve-favicon) - previously `favicon`
  - [serve-index](https://www.npmjs.com/package/serve-index) - previously `directory`
  - [serve-static](https://www.npmjs.com/package/serve-static) - previously `static`
  - [vhost](https://www.npmjs.com/package/vhost) - previously `vhost`

Most of these are exact ports of their Connect 2.x equivalents. The primary exception is `cookie-session`.

## License

This module is released under the MIT license.
The original author of **connect** is [TJ Holowaychuk](https://github.com/tj)

## Related

- [mxn-jsx-ast-transformer](https://github.com/ZimNovich/mxn-jsx-ast-transformer) - Transforms JSX AST into regular JS AST
- [mxn-jsx-transpiler](https://github.com/ZimNovich/mxn-jsx-transpiler) - Transpiles JSX to regular JavaScript
