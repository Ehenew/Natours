module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => next(err));
};

// What the catchAsync functions does? It wraps our async functions and as an async funcion returns a promise, then we can catch it whenever it the promise gets rejected
