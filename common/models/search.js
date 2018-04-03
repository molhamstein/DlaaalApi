'use strict';

module.exports = function(Search) {
  Search.beforeRemote('create', function (context, result, next) {
    // const currentCtx = LoopBackContext.getCurrentContext();
    if (context.res.locals.user.status !== 'active') {
      return next(errors.account.notActive());
    }
    context.req.body.ownerId = context.req.accessToken.userId;
    next();
  });
};
