const express = require('express');
const Helpers = require('../helpers');

function createRouter() {
  const router = express.Router();
  const methods = ['get', 'post', 'put', 'patch', 'delete'];

  for (const method of methods) {
    const original = router[method].bind(router);

    router[method] = (path, ...handlers) => {
      const wrappedHandlers = handlers.map(handler => {
        if (handler.name === 'wrapAsync' || handler.name.includes('bound wrapAsync')) return handler;
        const isAsync = handler.constructor.name === 'AsyncFunction';
        return isAsync ? Helpers.wrapAsync(handler) : handler;
      });
      return original(path, ...wrappedHandlers);
    };
  }

  return router;
}

module.exports = createRouter;
