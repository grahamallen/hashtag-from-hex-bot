var imgProcessor = require('./processImg')
, Twit = require('twit')
, config = require('../bin/config')
, _ = require('lodash')

module.exports = {
  readAllTweets: readAllTweets
}

var T = new Twit(config.twitter)

function readAllTweets() {
  return getMentionsTimeline().then(function(data) {
    return Promise.all(_.chain(data)
                        .map(extractMedia)
                        .filter(function(d) { return !!d })
                        .flatten()
                        .map(processMedia)
                        .value())
  }).then(function(processedMedia) {
    return processedMedia
  }).catch(function(err) { console.error(err) })
}

function getMentionsTimeline() {
  return new Promise(function(resolve, reject) {
    T.get('statuses/mentions_timeline', function(err, data, res) {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}  

function extractMedia(tweet) {
  var media = _.get(tweet, 'entities.media')
  if (media && media.length > 0) {
    var pictures = _.map(media, function(mediaObj) {
      return {
        handle: tweet.user.screen_name,
        url: mediaObj.media_url_https
      }
    })
    return pictures
  }
}

function processMedia(extractedMedia) {
  var result = _.merge({}, extractedMedia)
  return imgProcessor.processImg(extractedMedia.url).then(function(hexes) {
    result.hexes = hexes
    return result
  })
}

