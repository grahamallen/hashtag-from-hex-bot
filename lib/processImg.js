var ColorThief = require('color-thief')
, rgbToHex = require('rgb-hex')
, _ = require('lodash') 
, Jimp = require('jimp')

var colorThief = new ColorThief()

module.exports = {
  processImg: processImg
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

function processImg(url, numColors) {
  numColors = numColors || 5

  return Jimp.read(url).then(function(jimp) {
    return _.chain(getPalette(jimp))
            .map(rgbArrayToHex)
            .uniq()
            .map(function(color) { return "#" + color })
            .take(numColors)
            .value()
  }).catch(function(err) {
    console.error(err)
  })
}

