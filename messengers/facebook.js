var path = require('path')
var Bot = require('./bot')
var Botkit = require('botkit')

module.exports = class extends Bot {
  constructor () {
    super()

    this.bot = Botkit.facebookbot({
      access_token: process.env.FACEBOOK_ACCESS_TOKEN,
      verify_token: process.env.FACEBOOK_VERIFY_TOKEN
    })
  }

  setup (webserver) {
    super.setup(webserver)

    var hello = function (bot, message) {
      bot.reply(message, 'Welcome to plexbot!\n\nTo search for a TV show, send "add tv show name"\nTo search for a movie, send "add movie movie name"')
    }

    this.controller.on('facebook_optin', hello)
    this.controller.hears(['^[Hh]elp.*', '[?]'], 'message_received', hello)
  }

  setupWebserver (expressWebserver) {
    var bot = this.controller.spawn({})

    this.controller.createWebhookEndpoints(expressWebserver, bot)

    expressWebserver.get('/privacy', function (req, res) {
      res.sendFile(path.join(__dirname, '../assets/privacy.html'))
    })
  }

  addResult (result) {
    return {
      title: result.title + ' (' + result.year + ')',
      subtitle: result.description.slice(0, 250) + '...',
      image_url: result.image,
      /* default_action: {
        type: 'web_url',
        url: 'https://www.imdb.com/title/' + result.imdbid,
        messenger_extensions: true
      }, */
      buttons: [
        {
          type: 'postback',
          title: 'Add ' + result.title,
          payload: JSON.stringify({
            callback_id: 'add_show',
            cache_key: result.imdbid
          })
        }
      ]
    }
  }

  reply (bot, message, text, attachments) {
    bot.reply(message, {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'list',
          top_element_style: 'compact',
          elements: attachments.slice(0, 4)
        }
      }
    }, function (err, res) {
      if (err) {
        console.log('Error sending reply:', err)
      }
    })
  }

  replyInteractive (bot, message, title, body, imageUrl, titleUrl) {
    var element = {
      title: title,
      subtitle: body
    }

    var reply = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [element]
        }
      }
    }

    if (imageUrl) {
      element.image_url = imageUrl
    }

    if (titleUrl) {
      element.default_action = {
        type: 'web_url',
        url: titleUrl,
        messenger_extensions: true,
        webview_height_ratio: 'full'
      }
    }

    bot.reply(message, reply, function (err, res) {
      if (err) {
        console.log('Error sending reply:', err)
      }
    })
  }

  parseCallbackResponse (message) {
    var payload = JSON.parse(message.payload)
    return {
      callback_id: payload.callback_id,
      cache_key: payload.cache_key
    }
  }

  get callbackName () {
    return 'facebook_postback'
  }

  get events () {
    return 'message_received'
  }
}
