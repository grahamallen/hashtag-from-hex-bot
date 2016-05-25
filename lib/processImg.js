var ColorThief = require('color-thief')
, rgbToHex = require('rgb-hex')

var colorThief = new ColorThief()

module.exports = {
  getPalette: getPalette,
  rgbArrayToHex: rgbArrayToHex
}

function getPalette(imgPath) {
  return colorThief.getPalette(imgPath)
}

function rgbArrayToHex(rgbArray) {
  return rgbToHex.apply(this, rgbArray)
}

function process(imgPath) {
  return getPalette(imgPath).slice(0,6).map(rgbArrayToHex)
}
