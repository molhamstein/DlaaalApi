const cError = require('./cError');

module.exports.account = {
  authorizationRequired: function () {
    return new cError('AUTHORIZATION_REQUIRED', 401, 'Authorization Required', 401);
  },
  accessDenied: function () {
    return new cError('ACCESS_DENIED', 402, 'Access Denied', 403);
  },
  notFound: function () {
    return new cError('NOT_FOUND', 403, 'User not found', 404);
  },
  notActive: function () {
    return new cError('NOT_ACTIVE_USER', 404, 'User not active', 403);
  },
    notHasPhone: function () {
    return new cError('NOT_HAS_PHONE', 405, 'User hasn\'t phone', 405);
  },
  emailNotValid: function () {
    return new cError('EMAIL_NOT_VALID', 400, 'Email not valid', 400);
  }
};


module.exports.advertisemet = {
  notFound: function () {
    return new cError('NOT_FOUND', 100, 'Advertisement not found', 404);
  },
  sendEmail: function (messages, codes) {
    return new cError('ValidationError', 101, undefined, 422, {
      codes: codes,
      messages: messages
    });
  },
  sendEmailFailed: function () {
    return new cError('SEND_EMAIL_FAILED', 102, 'send message failed', 400);
  }
};

module.exports.follow = {
  followedPreviously: function () {
    return new cError('FOLLOWED', 200, 'User was followed previously', 400);
  },
  notFollowed: function () {
    return new cError('NOT_FOLLOWED', 201, 'User not followed yet', 400);
  }
};

