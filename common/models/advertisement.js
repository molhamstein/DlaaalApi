'use strict';
const path = require('path');
const ejs = require('ejs');
const configPath = process.env.NODE_ENV === undefined ?
  '../../server/config.json' :
  `../../server/config.${process.env.NODE_ENV}.json`;
const config = require(configPath);
const LoopBackContext = require('loopback-context');
const errors = require('../../server/errors');
const isEmail = require('isemail');

module.exports = function (Advertisement) {
  //status active/closed/expired

  function setIsBookmarked(result, ctx) {
    return new Promise(function (resolve, reject) {
      // const currentCtx = LoopBackContext.getCurrentContext();
      // const locals = currentCtx ? currentCtx.get('http').res.locals : 0;
      const locals = ctx.res.locals;
      if (locals && locals.user) {
        locals.user.bookmarks.find({}).then(advertisements => {
          const bookmarksIds = advertisements.map(function (advertisement) {
            return advertisement.id;
          });

          if (Array.isArray(result)) {
            result = result.map(res => {
              // console.log(res.id);
              // console.log(bookmarksIds[0]);
              res.isBookmarked = bookmarksIds.findIndex(o => o.toString() === res.id.toString()) !== -1;
              return res;
            });
            // console.log(result);
            resolve(result);
          } else {
            result.isBookmarked = bookmarksIds.findIndex(o => o.toString() === result.id.toString()) !== -1;
            resolve(result);
          }
        }).catch(err => reject(err));
      } else {
        resolve(result);
      }
    });
  }


  Advertisement.afterRemote('__get__identities', function (context, user, next) {
    console.log("teeeeeeeeeeeeeeeeeeeeeeeeesssssssssssssstttttttt");
    
    console.log("context.req.body");
    console.log(context.req.query);
    next();
  });

  Advertisement.afterRemote('find', function (context, user, next) {
    setIsBookmarked(context.result, context).then(result => {
      context.result = result;
      next();
    }).catch(err => next(err));
  });
  Advertisement.afterRemote('findById', function (context, user, next) {
    setIsBookmarked(context.result, context).then(result => {
      context.result = result;
      next();
    }).catch(err => next(err));
  });
  Advertisement.afterRemote('__get__actived', function (context, user, next) {
    setIsBookmarked(context.result, context).then(result => {
      context.result = result;
      next();
    }).catch(err => next(err));
  });

  Advertisement.beforeRemote('create', function (context, result, next) {
    // const currentCtx = LoopBackContext.getCurrentContext();
    if (context.res.locals.user.status !== 'active') {
      return next(errors.account.notActive());
    }
    context.req.body.ownerId = context.req.accessToken.userId;
    next();
  });

  Advertisement.afterRemote('create', function (context, advertisement, next) {
    // const currentCtx = LoopBackContext.getCurrentContext();
    // const user = currentCtx ? currentCtx.get('http').res.locals.user : 0;
    const user = context.res.locals.user;
    user.advertisementCount++;
    user.save();
    next();
  });
  Advertisement.afterRemote('deleteById', function (context, advertisement, next) {
    // const currentCtx = LoopBackContext.getCurrentContext();
    // const user = currentCtx ? currentCtx.get('http').res.locals.user : 0;
    const user = context.res.locals.user;
    if (context.result.count) {
      user.advertisementCount--;
      user.save();
    }
    next();
  });

  Advertisement.observe('before save', function (ctx, next) {
    if (!ctx.isNewInstance && ctx.data) {
      delete ctx.data.ownerId;
      delete ctx.data.categoryId;
      delete ctx.data.subCategoryId;
    }
    next();
  });

  Advertisement.afterRemote('findById', function (context, advertisement, next) {
    if (advertisement) {
      // const currentCtx = LoopBackContext.getCurrentContext();
      // const locals = currentCtx ? currentCtx.get('http').res.locals : 0;
      // const locals = context.res.locals;
      // if (!(locals.user && (locals.rolesNames.indexOf('admin') !== -1 || advertisement.ownerId === context.req.accessToken.userId)) && advertisement.status !== 'active')
      //   return next(errors.advertisemet.notFound());

      if (context.req.query.preventIncreaseViews) {
        advertisement.viewsCount++;
        advertisement.save();
      }
    }
    next();
  });


  Advertisement.sendEmail = (id, data, callback) => {
    Advertisement.findById(id).then(advertisement => {
      if (!advertisement) {
        callback(errors.advertisemet.notFound());
      }
      let validationMessage = {};
      let validationCode = {};
      if (!data.email) {
        validationMessage.email = ["can't be blank"];
        validationCode.email = ['presence'];
      } else if (!isEmail.validate(data.email)) {
        validationMessage.email = ["email not valid"];
        validationCode.email = ['not_valid'];
      }
      if (!data.name) {
        validationMessage.name = ["can't be blank"];
        validationCode.name = ['presence'];
      }
      if (!data.message) {
        validationMessage.message = ["can't be blank"];
        validationCode.message = ['presence'];
      }
      if (Object.keys(validationMessage).length) {
        callback(errors.advertisemet.sendEmail(validationMessage, validationCode));
      } else {
        Advertisement.app.models.User.findById(advertisement.ownerId).then(user => {
          if (!user) {
            return callback(errors.advertisemet.sendEmailFailed());
          }
          ejs.renderFile(path.resolve(__dirname + "../../../server/views/send-ads-email-template.ejs"), {
            user: data,
            advertisement: advertisement
          }, function (err, html) {
            if (err) {
              return callback(errors.advertisemet.sendEmailFailed());
            }
            Advertisement.app.models.Email.send({
              to: user.email,
              from: 'info@dlaaal.com',
              subject: 'email about ' + advertisement.title,
              html: html
            }, function (err) {
              if (err) {
                return callback(errors.advertisemet.sendEmailFailed());
              }
              callback(null);
            });
          });
        });
      }
    }).catch(callback);
  };

  Advertisement.remoteMethod('sendEmail', {
    http: {
      path: '/:id/send-email',
      verb: 'post',
      status: 204,
      errorStatus: 422
    },
    description: 'send email to ads owner',
    accepts: [
      {
        arg: 'id',
        type: 'number',
        description: 'Advertisement ID',
        http: { source: 'path' },
      },
      {
        arg: 'data',
        type: `{
        name:string,
        email:string.
        phone:string,
        message:string
        }`,
        description: ' send email to ads owner {email, name, phone, message}',
        http: { source: 'body' },
      }
    ],
    returns: []
  });
  //for send notification
  Advertisement.observe('after save', function (ctx, next) {
    if (ctx.isNewInstance) {
      // const currentCtx = LoopBackContext.getCurrentContext();
      // const locals = currentCtx ? currentCtx.get('http').res.locals : {};
      const user = Advertisement.app.currentUser;
      if (user && user.followers) {
        user.followers.find({}).then(users => {
          const notitications = users.map(user => {
            return {
              advertisementId: ctx.instance.id,
              ownerId: user.id,
              type: 'NEW_ADS'
            };
          });
          //add Notification to DB
          Advertisement.app.models.Notification.create(notitications)
            .then()
            .catch(err => console.log(err));
        });
      }
    }
    next();
  });
};
