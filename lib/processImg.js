var ColorThief = require('color-thief')
, rgbToHex = require('rgb-hex')
, _ = require('lodash') 

var colorThief = new ColorThief()

module.exports = {
  getPalette: getPalette,
  rgbArrayToHex: rgbArrayToHex,
  process: process
}

function getPalette(jimp) {
  var width = jimp.bitmap.width
  , height = jimp.bitmap.height
  , pixelCount = width * height
  , pixels = new Buffer(jimp.bitmap.data)

  return colorThief.getPaletteFromPixels(pixels, pixelCount, 10, 10)
}

function rgbArrayToHex(rgbArray) {
  return rgbToHex.apply(this, rgbArray)
}

function process(jimp) {
  return _.chain(getPalette(jimp))
          .map(rgbArrayToHex)
          .uniq()
          .take(5)
          .value()
}
