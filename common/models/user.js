'use strict';
const path = require('path');
const ejs = require('ejs');
const configPath = process.env.NODE_ENV === undefined ?
  '../../server/config.json' :
  `../../server/config.${process.env.NODE_ENV}.json`;
const config = require(configPath);
const LoopBackContext = require('loopback-context');
const errors = require('../../server/errors');

module.exports = function (User) {
  //status pending/active/deactivated

  User.disableRemoteMethodByName('prototype.__count__notifications');
  User.disableRemoteMethodByName('prototype.__create__notifications');
  User.disableRemoteMethodByName('prototype.__delete__notifications');
  User.disableRemoteMethodByName('prototype.__findById__notifications');
  User.disableRemoteMethodByName('prototype.__updateById__notifications');
  User.disableRemoteMethodByName('prototype.__destroyById__notifications');

  //send verification email after registration
  function sendVerificationEmail(user, subject, message, callback) {
    var options = {
      type: 'email',
      to: user.email,
      from: 'dlaaalsite@gmail.com',
      subject: subject,
      message: message,
      template: path.resolve(__dirname, '../../server/views/verify-template.ejs'),
      user: user
    };

    options.verifyHref = "http://104.217.253.15/dlaaalApp/Dlaaal-webApp/dist/#" +
      '/login/verify' +
      '?uid=' + options.user.id;
    user.verify(options, function (err, res) {
      if (err) {
        User.deleteById(user.id);
        callback(err)
      }
      callback(null, user);
    });
  }



  function setIsFollowed(result, ctx) {
    console.log("setIsFollowed");

    return new Promise(function (resolve, reject) {
      // const currentCtx = LoopBackContext.getCurrentContext();
      // const locals = currentCtx ? currentCtx.get('http').res.locals : 0;
      const locals = ctx ? ctx.res.locals : 0;
      if (locals && locals.user) {
        locals.user.following.find({}).then(users => {
          const followingIds = users.map(function (user) {
            return user.id;
          });
          if (Array.isArray(result)) {
            console.assert("Teeeeeeeest")
            result = result.map(res => {
              res.isFollowed = followingIds.findIndex(o => o.toString() === res.id.toString()) !== -1;
              return res;
            });
            resolve(result);
          } else {
            result.isFollowed = followingIds.findIndex(o => o.toString() === result.id.toString()) !== -1;
            resolve(result);
          }
        }).catch(err => reject(err));
      } else {
        resolve(result);
      }
    });
  }





  User.afterRemote('find', function (context, user, next) {
    setIsFollowed(context.result, context).then(result => {
      context.result = result;
      next();
    }).catch(err => next(err));
  });
  User.afterRemote('findById', function (context, user, next) {
    console.log("findById");
    setIsFollowed(context.result, context).then(result => {
      context.result = result;
      next();
    }).catch(err => next(err));
  });

  User.afterRemote('create', function (context, user, next) {
    sendVerificationEmail(user, 'Thanks for registering.', '', function (err, res) {
      if (err)
        next(err);
      next();
    })
  });

  //send password reset link when requested
  User.on('resetPasswordRequest', function (info) {
    // let url = `${config.siteDomain}/login/reset-password?access_token=${info.accessToken.id}&user_id=${info.user.id}`;
    let url = "http://104.217.253.15/dlaaalApp/Dlaaal-webApp/dist/#" + `/login/reset-password?access_token=${info.accessToken.id}&user_id=${info.user.id}`;
    ejs.renderFile(path.resolve(__dirname + "../../../server/views/reset-password-template.ejs"), { url: url }, function (err, html) {
      if (err) return console.log('> error sending password reset email', err);
      User.app.models.Email.send({
        to: info.email,
        from: 'info@dlaaal.com',
        subject: 'Password reset',
        html: html
      }, function (err) {
        if (err) return console.log('> error sending password reset email');
      });
    });
  });

  User.afterRemote('confirm', function (context, user, next) {
    User.findById(context.req.query.uid).then(user => {
      user.status = 'active';
      user.save();
      next();
    }).catch(err => next(err));
  });

  //deactivate user
  User.deactivate = (id, callback) => {
    User.findById(id).then(user => {
      user.status = 'deactivated';
      user.save().then((user) => callback(null, user));
    }).catch(callback);
  };

  User.remoteMethod('deactivate', {
    http: {
      path: '/:id/deactivate', verb: 'put',
    },
    description: 'Deactivate user',
    accepts: [
      {
        arg: 'id',
        type: 'number',
        description: 'User ID',
        http: { source: 'path' },
      }
    ],
    returns: [
      {
        arg: 'data', type: 'User', root: true,
      }
    ]
  });




  //activate user
  User.activate = (id, callback) => {
    User.findById(id).then(user => {
      user.status = 'active';
      user.save().then((user) => callback(null, user));
    }).catch(callback);
  };

  User.remoteMethod('activate', {
    http: {
      path: '/:id/activate', verb: 'put',
    },
    description: 'Ativate user',
    accepts: [
      {
        arg: 'id',
        type: 'number',
        description: 'User ID',
        http: { source: 'path' },
      }
    ],
    returns: [
      {
        arg: 'data', type: 'User', root: true,
      }
    ]
  });

  User.contactus = (data, callback) => {
    User.app.models.Email.send({
      to: "world.of.anas.95@gmail.com",
      from: data.email,
      subject: data.subject,
      html: '<b>From : </b>'+data.email+'<br><p>'+data.message+'</p>'
    }, function (err) {
      if (err) return console.log('> error sending password reset email');
      callback();
    });
  };

  User.remoteMethod('contactus', {
    http: {
      path: '/contactUs', verb: 'post',
    },
    description: 'contact with dlaaal\'s admins',
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' } }
    ],
    returns: [
      {
        arg: 'data', type: 'User', root: true,
      }
    ]
  });
  // {"email":"test",
  // "title":"title",
  // "message":"Messssssssage"}

  //get my info /me
  User.remoteMethod('me', {
    http: {
      path: '/me', verb: 'get'
    },
    description: 'get my info ',
    accepts: [
    ],
    returns: [
      {
        arg: 'data', type: 'User', root: true
      }
    ]
  });


  User.me = (callback) => {
    // const currentCtx = LoopBackContext.getCurrentContext();
    // const user = currentCtx.get('http').res.locals.user;
    if (User.app.currentUser) {
      callback(null, User.app.currentUser);
    } else {
      callback(errors.account.authorizationRequired());
    }
  };











  //Make Notification Read
  User.remoteMethod('makeNotificationRead', {
    http: {
      path: '/:id/mak-notifications-read', verb: 'put'
    },
    description: 'Make My Notification Read',
    accepts: [
      {
        arg: 'id',
        type: 'string',
        description: 'User ID',
        http: { source: 'path' },
      }
    ],
    returns: []
  });
  User.makeNotificationRead = (id, callback) => {
    // const currentCtx = LoopBackContext.getCurrentContext();
    // const user = currentCtx.get('http').res.locals.user;
    // if (userId === id) {
    //add Notification to DB
    User.app.models.Notification.updateAll({ ownerId: id }, { isRead: true })
      .then(() => callback(null))
      .catch(callback);
    // } else {
    //   callback(errors.account.authorizationRequired());
    // }
  };

  User.beforeRemote('prototype.__link__following', function (context, user, next) {
    // const currentCtx = LoopBackContext.getCurrentContext();
    // const locals = currentCtx ? currentCtx.get('http').res.locals : 0;
    const locals = context.res.locals;
    locals.user.following.find({}).then(users => {
      const followingIds = users.map(function (user) {
        return user.id;
      });
      if (followingIds.indexOf(parseInt(context.req.params.fk)) !== -1) {
        next(errors.follow.followedPreviously());
      } else {
        next();
      }
    });
  });

  User.afterRemote('prototype.__link__following', function (context, user, next) {
    User.findById(user.userId).then(user => {
      user.followersCount++;
      user.save().then(() => next());
    }).catch(err => next(err));
  });

  User.beforeRemote('prototype.__unlink__following', function (context, user, next) {
    // const currentCtx = LoopBackContext.getCurrentContext();
    // const locals = currentCtx ? currentCtx.get('http').res.locals : 0;
    const locals = context.res.locals;
    locals.user.following.find({}).then(users => {
      const followingIds = users.map(function (user) {
        return parseInt(user.id);
      });
      if (followingIds[0] == context.req.params.fk) {
        console.log(followingIds.indexOf(parseInt(context.req.params.fk)));
      } else {
        console.log(false);
      }
      if (followingIds.indexOf(parseInt(context.req.params.fk)) === -1) {
        return next(errors.follow.notFollowed());
      } else {
        next();
      }
    });
  });

  User.afterRemote('prototype.__unlink__following', function (context, user, next) {
    User.findById(context.req.params.fk).then(user => {
      user.followersCount--;
      user.save().then(() => next());
    }).catch(err => next(err));
  });



};

