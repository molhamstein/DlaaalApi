module.exports = function (app) {
  const uuid = require('uuid/v1');

  app.dataSources.storage.connector.getFilename = function (file, req, res) {
    const parts = file.name.split('.'),
      extension = parts[parts.length - 1];
    const newFilename = (req.accessToken ? req.accessToken.userId : 0 ) + (new Date()).getTime() + '.' + extension;
    return uuid() + newFilename;
  };

  app.dataSources.storage.connector.allowedContentTypes = ["image/jpg", "image/jpeg", "image/png"];
  app.dataSources.storage.connector.maxFileSize = 9999999999999999999999999999999999999999999999999999999;

};
