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
    var atMe = _.chain(tweet)
                .get(['entities', 'user_mentions'])
                .map('screen_name')
                .some(function(str) { return str.toLowerCase() === 'hexhashtag'})
                .value()
    if (atMe) {
      processTweet(tweet).then(function(processedMedia) {
        if (processedMedia.length > 0) {
          replyQueue = replyQueue.concat(processedMedia)
        }
        console.log("tweet received: " + tweet.id_str)
      })
    }
  })
}

function replyToTweets() {
  setInterval(replyToTweet, 60000)
}

function replyToTweet() {
  console.log(replyQueue)
  if (replyQueue.length > 0) {
    var reply = replyQueue.shift()
    , twitStatus = "@" + reply.handle + " " + reply.hexes.join(" ")
    , tweet = { 'status': twitStatus, 'in_reply_to_status_id': reply.origId }

    var b64content = reply.encodedBuff.toString('base64')

    T.post('media/upload', { media_data: b64content }, function(err, data, response) {
      if (err) { console.log(response); return console.error(err) }

      tweet.media_ids = [ data.media_id_string ]

      T.post('statuses/update', tweet, function(err, data, response) {
        if (err) { return console.error(err) }

        console.log("tweet reply sent: " + tweet.in_reply_to_status_id)
      })
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
  var media = _.get(tweet, 'extended_entities.media') || _.get(tweet, 'entities.media')
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
  return imgProcessor.processImg(extractedMedia.url).then(function(processedImg) {
    result.hexes = processedImg.hexes
    result.decodedBuff = processedImg.decodedBuff
    result.encodedBuff = processedImg.encodedBuff
    return result
  })
}

