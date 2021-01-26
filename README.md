# mxn-connect

**mxn-connect** is a fork of [**connect**](https://github.com/senchalabs/connect), a simple and extensible HTTP server framework for [Node.js](http://nodejs.org) using "plugins" known as **middleware**.

The core of **mxn-connect** is "using" **middleware**. Middleware are added as a "stack" where incoming requests will execute each middleware one-by-one until a middleware does not call `next()` within it.

The original author of **connect** is [TJ Holowaychuk](https://github.com/tj)

## Install

```
$ npm install mxn-connect
```

## Usage

Use it like this in your rollup.config:

```js
var connect = require('connect');
var http = require('http');

var app = connect();

// gzip/deflate outgoing responses
var compression = require('compression');
app.use(compression());

// store session state in browser cookie
var cookieSession = require('cookie-session');
app.use(cookieSession({
    keys: ['secret1', 'secret2']
}));

// parse urlencoded request bodies into req.body
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

// respond to all requests
app.use(function(req, res){
  res.end('Hello from Connect!\n');
});

//create node.js http server and listen on port
http.createServer(app).listen(3000);
```


```js
import rollupMxnJsx from "rollup-plugin-mxn-jsx";

export default {
	input: "src/index.js",
	external: [
		"preact",
		"prop-types"
	],
	output: {
		file: "bundle/bundle.js",
		format: "iife",
		name: "App",
		sourcemap: false,
		globals: {
			"preact": "preact",
			"prop-types": "PropTypes"
		}
	},
	plugins: [
		rollupMxnJsx({
			factory: "h",
			include: ["*.js", "*.jsx"]
		})
	]
};

```

## License

This module is released under the MIT license.

## Related

- [mxn-jsx-ast-transformer](https://github.com/ZimNovich/mxn-jsx-ast-transformer) - Transforms JSX AST into regular JS AST
- [mxn-jsx-transpiler](https://github.com/ZimNovich/mxn-jsx-transpiler) - Transpiles JSX to regular JavaScript
