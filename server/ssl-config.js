var path = require('path'),
fs = require("fs");
exports.privateKey = fs.readFileSync(path.join('/private/privatekey.pem')).toString();
exports.certificate = fs.readFileSync(path.join('private/certificate.pem')).toString();