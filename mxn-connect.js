/*!
 * connect
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2015 Douglas Christopher Wilson
 * Copyright(c) 2020 Ilya A. Zimnovich
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 * @private
 */

const EventEmitter = require("events").EventEmitter;
const http = require("http");

const debug = require("debug")("connect:dispatcher");
const finalhandler = require("finalhandler");
const parseUrl = require("parseurl");

// ########################################################################
// Helpers
// ########################################################################

// Merge object's properties
// From: https://www.npmjs.com/package/utils-merge
const merge = function(dst, src) {
    if (dst && src) {
        for (const key in src) {
            dst[key] = src[key];
        }
    }
    return dst;
};

// Merge objects using descriptors
// From: https://www.npmjs.com/package/merge-descriptors
const mixin = function(dst, src) {
    if (dst && src) {
        Object.getOwnPropertyNames(src).forEach(function(name) {
            if (!dst.hasOwnProperty(name)) {
                const descriptor = Object.getOwnPropertyDescriptor(src, name);
                Object.defineProperty(dst, name, descriptor);
            }
        });
    }
    return dst;
};

// This method is used to break up long running operations and run
// a callback function immediately after the node.js has completed
// other operations such as events and display updates.
//
// Syntax:
// - var immediateID = setImmediate(func, [param1, param2, ...]);
const defer = (typeof setImmediate === "function")
    ? setImmediate
    : function(func) { process.nextTick(func.bind.apply(func, arguments)) };

// Private module variables.
const env = process.env.NODE_ENV || "development";
const core = {};

/**
 * Create a new connect server.
 *
 * @return {function}
 * @public
 */

function createServer()
{
    const app = function (req, res, next) {
        app.handle(req, res, next);
    }

    merge(app, EventEmitter.prototype);
    merge(app, core);

    // expose the prototype that will get set on requests
    // app.request = Object.create(req, {
    //     app: { configurable: true, enumerable: true, writable: true, value: app }
    // });

    // expose the prototype that will get set on responses
    // app.response = Object.create(res, {
    //     app: { configurable: true, enumerable: true, writable: true, value: app }
    // });

    app.route = "/";
    app.stack = [];

    return app;
}

/**
 * Utilize the given middleware `handle` to the given `route`,
 * defaulting to _/_. This "route" is the mount-point for the
 * middleware, when given a value other than _/_ the middleware
 * is only effective when that segment is present in the request's
 * pathname.
 *
 * For example if we were to mount a function at _/admin_, it would
 * be invoked on _/admin_, and _/admin/settings_, however it would
 * not be invoked for _/_, or _/posts_.
 *
 * @param {String|Function|Server} route, callback or server
 * @param {Function|Server} callback or server
 * @return {Server} for chaining
 * @public
 */

core.use = function use(route, handler)
{
    // no route is given
    // default route to "/"
    if (typeof route !== "string") {
        handler = route;
        route = "/";
    }

    // wrap sub-apps
    // (objects with method "handle")
    if (typeof handler.handle === "function") {
        let server = handler;
        server.route = route;
        handler = function (req, res, next) {
            server.handle(req, res, next);
        };
    }

    // wrap vanilla http.Servers
    if (handler instanceof http.Server) {
        handler = handler.listeners("request")[0];
    }

    // strip trailing slash
    if (route[route.length - 1] === "/") {
        route = route.slice(0, -1);
    }

    // add the middleware
    debug("use %s %s", route || "/", handler.name || "anonymous");
    this.stack.push({
        route: route,
        handler: handler
    });

    return this;
};

/**
 * Handle server requests, punting them down
 * the middleware stack.
 *
 * @private
 */

core.handle = function handle(req, res, out)
{
    var index = 0; // index of current handler
    var protohost = getProtohost(req.url) || "";
    var removed = "";
    var slashAdded = false;
    var stack = this.stack;

    // final function handler
    var done = out || finalhandler(req, res, {
        env: env,
        onerror: logerror
    });

    // store the original URL
    req.originalUrl = req.originalUrl || req.url;

    function next(err)
    {
        if (slashAdded) {
            req.url = req.url.substr(1);
            slashAdded = false;
        }

        if (removed.length !== 0) {
            req.url = protohost + removed + req.url.substr(protohost.length);
            removed = "";
        }

        // next callback
        var layer = stack[index++];

        // all done
        if (!layer) {
            defer(done, err);
            return;
        }

        // route data
        var path = parseUrl(req).pathname || "/";
        var route = layer.route;

        // skip this layer if the route doesn't match
        if (path.toLowerCase().substr(0, route.length) !== route.toLowerCase()) {
            return next(err);
        }

        // skip if route match does not border "/", ".", or end
        var c = path.length > route.length && path[route.length];
        if (c && c !== "/" && c !== ".") {
            return next(err);
        }

        // trim off the part of the url that matches the route
        if (route.length !== 0 && route !== "/") {
            removed = route;
            req.url = protohost + req.url.substr(protohost.length + removed.length);

            // ensure leading slash
            if (!protohost && req.url[0] !== "/") {
                req.url = "/" + req.url;
                slashAdded = true;
            }
        }

        // call the layer handle
        call(layer.handler, route, err, req, res, next);
    }

    next();
};

/**
 * Listen for connections.
 *
 * This method takes the same arguments
 * as node's `http.Server#listen()`.
 *
 * HTTP and HTTPS:
 *
 * If you run your application both as HTTP
 * and HTTPS you may wrap them individually,
 * since your Connect "server" is really just
 * a JavaScript `Function`.
 *
 *      var connect = require("connect")
 *        , http = require("http")
 *        , https = require("https");
 *
 *      var app = connect();
 *
 *      http.createServer(app).listen(80);
 *      https.createServer(options, app).listen(443);
 *
 * @return {http.Server}
 * @api public
 */

core.listen = function listen() {
    let server = http.createServer(this);
    return server.listen.apply(server, arguments);
};

/**
 * Invoke a route handle.
 * @private
 */

function call(handle, route, err, req, res, next)
{
    var arity = handle.length;
    var error = err;
    var hasError = Boolean(err);
  
    debug("%s %s : %s", handle.name || "<anonymous>", route, req.originalUrl);
  
    try {
      if (hasError && arity === 4) {
        // error-handling middleware
        handle(err, req, res, next);
        return;
      } else if (!hasError && arity < 4) {
        // request-handling middleware
        handle(req, res, next);
        return;
      }
    } catch (e) {
      // replace the error
      error = e;
    }
  
    // continue
    next(error);
}

/**
 * Log error using console.error.
 *
 * @param {Error} err
 * @private
 */

function logerror(err) {
    if (env !== "test") console.error(err.stack || err.toString());
}

/**
 * Get get protocol + host for a URL.
 *
 * @param {string} url
 * @private
 */

function getProtohost(url)
{
    if (url.length === 0 || url[0] === "/") {
      return undefined;
    }

    var fqdnIndex = url.indexOf("://")

    return fqdnIndex !== -1 && url.lastIndexOf("?", fqdnIndex) === -1
      ? url.substr(0, url.indexOf("/", 3 + fqdnIndex))
      : undefined;
}

/**
 * Module exports.
 * @public
 */

module.exports = createServer;
