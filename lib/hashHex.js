var imgProcessor = require('./processImg')
, Twit = require('twit')
, config = require('../bin/config')
, _ = require('lodash')

var replyQueue = []
, T = new Twit(config.twitter)
, stream = T.stream('user')

module.exports = {
  readTweets: readTweets,
  replyToTweets: replyToTweets,
  replyToTweet: replyToTweet,
  processTweet: processTweet,
  T: T,
  replyQueue: replyQueue 
}

function readTweets() {
  stream.on('tweet', function(tweet) {
    processTweet(tweet).then(function(processedMedia) {
      if (processedMedia.length > 0) {
        replyQueue = replyQueue.concat(processedMedia)
      }
      console.log(tweet)
    })
  })
}

function replyToTweets() {
  setInterval(replyToTweet, 120000)
}

function replyToTweet() {
  if (replyQueue.length > 0) {
    var reply = replyQueue.shift()
    , tweet = ""

    tweet += "@" + reply.handle + " " + reply.hexes.join(" ")

    T.post('statuses/update', { 'status': tweet, 'in_reply_to_status_id': reply.origId }, function(err, data, response) {
      if (err) { console.error(err) }

      console.log(data)
    })
  }
}

function processTweet(tweet) {
  return Promise.all(_.chain(extractMedia(tweet))
                      .filter(function(d) { return !!d })
                      .flatten()
                      .map(processMedia)
                      .value())
  .catch(function(err) { console.error(err) })
}

function extractMedia(tweet) {
  var media = _.get(tweet, 'entities.media')
  if (media && media.length > 0) {
    var pictures = _.map(media, function(mediaObj) {
      return {
        handle: tweet.user.screen_name,
        url: mediaObj.media_url_https,
        origId: tweet.id_str
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

