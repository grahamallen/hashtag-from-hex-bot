var hashHex = require('..')

hashHex.readTweets()
hashHex.replyToTweets()

/*
function debug(id) {
  hashHex.T.get('statuses/show/' + id, function(err, data, response) {
    if (err) { console.log(err) }

    hashHex.processTweet(data).then(function(processedMedia) {
      //var metaData = processedMedia.shift()
      //hashHex.replyQueue.push(metaData)
      //hashHex.replyToTweet()
      console.log(processedMedia)
    }).catch(console.error)
  })
}

debug('740683288688373760')
//debug('741536473770385408')
*/
