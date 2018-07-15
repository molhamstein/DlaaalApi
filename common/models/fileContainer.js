'use strict';
const configPath = process.env.NODE_ENV === undefined ? '../../server/config.json' : `../../server/config.${process.env.NODE_ENV}.json`;
const config = require(configPath);

module.exports = function (FileContainer) {

  FileContainer.afterRemote('upload', function (context, result, next) {
    let files = [];
    result.result.files.file.forEach((file) => {
      files.push("http://108.179.218.237:7500"+ config.restApiRoot + FileContainer.http.path + "/" + file.container + '/download/' + file.name);
    });
    context.res.json(files);
  });
};
