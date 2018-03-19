const config = require('../config.json');
module.exports = function (options) {
  return function logError(err, req, res, next) {
    res.locals.error = err;
    res.status(err.statusCode || 500);

    if (err.name === 'ValidationError') {
      res.locals.error.message = err.details.messages || res.locals.error.message;
      res.locals.error.code = err.details.codes || res.locals.error.code;
    }
    if (!process.env.NODE_ENV) {
      console.log(err);
    }
    res.json({
      name: res.locals.error.name,
      statusCode: res.locals.error.statusCode,
      code: res.locals.error.code,
      message: res.locals.error.message
    });
  };
};
