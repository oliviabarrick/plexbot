var metrics = require('./metrics')
var argparser = require('./args')
var cache = require('memory-cache')

var providers = {
  'tv': require('./providers/sonarr'),
  'movie': require('./providers/radarr'),
  'couchpotato': require('./providers/couchpotato')
}

var addShow = function (controller, bot, cacheKey, message) {
  var toAdd = cache.get(cacheKey)

  if (toAdd == null) {
    controller.replyInteractive(bot, message, 'Error!',
      'Search timed out, try searching again?')
  }

  var description = toAdd.description.slice(0, 250) + '...'

  metrics.added_count.labels(toAdd.type).inc()

  if (toAdd.already_added) {
    var title = toAdd.title + ' is already added!'
    controller.replyInteractive(bot, message, title, description,
      toAdd.image, toAdd.provider_url)
    return
  }

  providers[toAdd.type].add(toAdd).then(function (res) {
    var title = 'Added ' + toAdd.title + '!'
    controller.replyInteractive(bot, message, title, description, toAdd.image,
      toAdd.provider_url)
  }).catch(function (err) {
    if (err.toString().includes('has already been added')) {
      var title = toAdd.title + ' is already added!'
      controller.replyInteractive(bot, message, title, description, toAdd.image,
        toAdd.provider_url)
    } else {
      var text = 'Failed to add ' + toAdd.title + '!\n' + err
      controller.replyInteractive(bot, message, 'Error!', text)
    }
  })
}

var callbacks = {
  'add_show': addShow
}

module.exports = function (controller) {
  return {
    interactiveHandler: function (bot, message) {
      console.log('interactive received: ', message)

      var resp = controller.parseCallbackResponse(message)

      callbacks[resp.callback_id](controller, bot, resp.cache_key, message)
    },
    searchHandler: function (bot, message) {
      console.log('received: ', message)
      var type = message.match[1].toLowerCase()
      var args = argparser.parse(message.match[2].split(' '))

      metrics.searches_count.labels(type).inc()

      providers[type].search(args.search.join(' '), args).then(function (results) {
        var attachments = []

        results.forEach(function (result) {
          attachments.push(controller.addResult(result))
          result.type = type
          cache.put(result.imdbid, result, 600000)
        })

        var body = 'Your results for "' + args.search.join(' ') + '":'
        controller.reply(bot, message, body, attachments)
      })

      metrics.completed_searches_count.labels(type).inc()
    }
  }
}
