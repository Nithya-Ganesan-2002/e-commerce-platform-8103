 /**
  * Wrap async Express handlers to forward errors to next()
  * @param {Function} fn
  * @returns {Function}
  */
 // PUBLIC_INTERFACE
 function asyncHandler(fn) {
   /** Wraps an async route handler and handles errors. */
   return function wrapped(req, res, next) {
     Promise.resolve(fn(req, res, next)).catch(next);
   };
 }
 module.exports = asyncHandler;
