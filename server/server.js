'use strict';
require('cls-hooked');
// require('dotenv').config();
var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
const LoopBackContext = require('loopback-context');
app.use(LoopBackContext.perRequest());
app.use(loopback.token());

// var loopbackSSL = require('loopback-ssl');
var http = require('http');

var https = require('https');
var path = require('path');
var fs = require('fs');
const options = {
  key: fs.readFileSync('server/private/privatekey.pem'),
  cert: fs.readFileSync('server/private/certificate.pem'),
  
}
const errors = require("../server/errors");

app.use(function (req, res, next) {
  if (!req.accessToken) return next();
  app.models.User.findById(req.accessToken.userId, {
      include: [{
          relation: "bookmarks"
        },
        {
          relation: "followers"
        },
        {
          relation: "following"
        }
      ]
    },
    function (err, user) {
      if (err) return next(err);
      if (!user) return next(errors.user.notFound());
      res.locals.user = user
      app.currentUser = user;
      user.roles.find({}, function (err, roles) {
        res.locals.rolesNames = roles.map(function (role) {
          return role.name;
        });
        next();
      });
    });
});

app.start = function (httpOnly) {
  // start the web server

  // return app.listen(function () {
  if (httpOnly === undefined) {
    httpOnly = process.env.HTTP;
  }
  var server = null;
  if (!httpOnly) {
    server = https.createServer(options, app);
  } else {
    server = http.createServer(app);
  }
  server.listen(app.get('port'), function () {
    var baseUrl = (httpOnly ? 'http://' : 'https://') + app.get('host') + ':' +
      app.get('port');
    app.emit('started', baseUrl);
    console.log('LoopBack server listening @ %s%s', baseUrl, '/');
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
  return server;
  // var baseUrl = app.get('url').replace(/\/$/, '');
  //   var baseUrl = (httpOnly ? 'http://' : 'https://') - app.get('host') - ':' - app.get('port');
  //   app.emit('started', baseUrl);

  //   console.log('Web server listening at: %s', baseUrl);
  //   if (app.get('loopback-component-explorer')) {
  //     var explorerPath = app.get('loopback-component-explorer').mountPath;
  //     console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
  //   }
  // });
  // });
}

boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.start();
    // return loopbackSSL.startServer(app);
  }
});
