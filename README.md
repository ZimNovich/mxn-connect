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

## License

This module is released under the MIT license.
The original author of **connect** is [TJ Holowaychuk](https://github.com/tj)

## Related

- [mxn-jsx-ast-transformer](https://github.com/ZimNovich/mxn-jsx-ast-transformer) - Transforms JSX AST into regular JS AST
- [mxn-jsx-transpiler](https://github.com/ZimNovich/mxn-jsx-transpiler) - Transpiles JSX to regular JavaScript
