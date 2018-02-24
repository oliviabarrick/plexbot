var metrics = require('./metrics')
var argparser = require('./args')
var cache = require('memory-cache')

var providers = {
  'tv': require('./providers/sonarr'),
  'movie': require('./providers/couchpotato'),
  'radarr': require('./providers/radarr')
}

var createAttachment = function (result) {
  var actions = []

  if (!result.already_added) {
    actions.push({
      name: 'Add',
      text: 'Add',
      value: result.imdbid,
      type: 'button'
    })
  } else {
    actions.push({
      name: 'Already added',
      text: 'Already added',
      value: result.imdbid,
      type: 'button'
    })
  }

  return {
    title: '<http://www.imdb.com/title/' + result.imdbid + '|' + result.title + '> (' + result.year + ')',
    text: result.description.slice(0, 250) + '...',
    thumb_url: result.image,
    name: result.title,
    callback_id: 'add_show',
    actions: actions
  }
}

var addShow = function (bot, message) {
  var toAdd = cache.get(message.actions[0].value)

  if (toAdd == null) {
    bot.replyInteractive(message, 'unknown callback')
  }

  metrics.added_count.labels(toAdd.type).inc()

  if (toAdd.already_added) {
    bot.replyInteractive(message, {
      attachments: [
        {
          title: '<' + toAdd.provider_url + '|' + toAdd.title + '> is already added!',
          text: toAdd.description.slice(0, 250) + '...',
          thumb_url: toAdd.image
        }
      ]
    })

    return
  }

  providers[toAdd.type].add(toAdd).then(function (res) {
    bot.replyInteractive(message, {
      attachments: [
        {
          title: 'Added <' + toAdd.provider_url + '|' + toAdd.title + '>!',
          text: toAdd.description.slice(0, 250) + '...',
          thumb_url: toAdd.image
        }
      ]
    })
  }).catch(function (err) {
    bot.replyInteractive(message, {
      text: 'Failed to add <' + toAdd.provider_url + '|' + toAdd.title + '>! ' + err
    })
  })
}

var callbacks = {
  'add_show': addShow
}

module.exports.interactiveHandler = function (bot, message) {
  callbacks[message.callback_id](bot, message)
}

module.exports.searchHandler = function (bot, message) {
  var type = message.match[1]
  var args = argparser.parse(message.match[2].split(' '))

  metrics.searches_count.labels(type).inc()

  providers[type].search(args.search, args).then(function (results) {
    var attachments = []

    results.forEach(function (result) {
      attachments.push(createAttachment(result))
      result.type = type
      cache.put(result.imdbid, result, 600000)
    })

    bot.reply(message, {
      text: 'Your results for "' + args.search + '":',
      attachments: attachments
    })
  })

  metrics.completed_searches_count.labels(type).inc()
}
