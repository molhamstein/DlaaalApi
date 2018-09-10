'use strict';
const configPath = process.env.NODE_ENV === undefined ? '../../server/config.json' : `../../server/config.${process.env.NODE_ENV}.json`;
const config = require(configPath);
const path = require('path');
var images = require("images");
var sizeOf = require('image-size');


module.exports = function (FileContainer) {

  FileContainer.afterRemote('upload', function (context, result, next) {
    let src = path.join(__dirname, '../../files/');
    var folderName = context.req.params.container;
    var logoUrl = src + "logo.PNG"

    var dimensionsLogo = sizeOf(logoUrl);
    var logoRate = dimensionsLogo.height / dimensionsLogo.width;
    console.log("dimensionsLogo")
    console.log(dimensionsLogo)
    console.log("logoRate")
    console.log(logoRate)
    let files = [];
    result.result.files.file.forEach((file) => {
      if (folderName == "images") {
        var imageUrl = src + "/" + folderName + "/" + file.name
        var dimensionsImage = sizeOf(imageUrl);
        var newHeightLogo = dimensionsImage.height * 0.5;
        var newWidthtLogo = newHeightLogo / logoRate;
        var marginLeft = (dimensionsImage.width - newWidthtLogo) / 2
        var marginTop = dimensionsImage.height * 0.25;
        if (newWidthtLogo > dimensionsImage.width) {
          newWidthtLogo = dimensionsImage.width * 0.9;
          newHeightLogo = newWidthtLogo * logoRate;
          marginTop = (dimensionsImage.height - newHeightLogo) / 2
          marginLeft = dimensionsImage.width * 0.05
        }
        images(imageUrl).draw(images(logoUrl).resize(newWidthtLogo, newHeightLogo), marginLeft, marginTop).save(src + "/" + folderName + "/" + file.name);
      }
      files.push("http://108.179.218.237:7500" + config.restApiRoot + FileContainer.http.path + "/" + file.container + '/download/' + file.name);
    });
    context.res.json(files);
  });
};
