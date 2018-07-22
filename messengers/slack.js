var Bot = require('./bot')
var Botkit = require('botkit')

module.exports = class extends Bot {
  constructor () {
    super()

    this.bot = Botkit.slackbot({
      json_file_store: process.env.PLEXBOT_DATABASE
    }).configureSlackApp({
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      redirectUri: process.env.SLACK_APP_URL,
      scopes: ['bot']
    })
  }

  setup (webserver) {
    super.setup(webserver)

    var self = this

    this.controller.on('create_bot', function (bot, config) {
      bot.startRTM(function (err) {
        if (err) {
          console.log(err)
          process.exit(1)
        }
      })
    })

    this.controller.on('rtm_close', function (bot) {
      console.log('Slack connection closed!')
      process.exit(1)
    })

    this.controller.storage.teams.all(function (err, teams) {
      if (err) {
        console.log(err)
        process.exit(1)
      }

      for (var t in teams) {
        if (teams[t].bot) {
          self.controller.spawn(teams[t]).startRTM(function (err, bot) {
            if (err) {
              console.log('Error connecting bot to Slack:', err)
            }
          })
        }
      }
    })
  }

  setupWebserver (expressWebserver) {
    this.controller.createWebhookEndpoints(expressWebserver)

    this.controller.createOauthEndpoints(expressWebserver, function (err, req, res) {
      if (err) {
        res.status(500).send('ERROR: ' + err)
      } else {
        res.send('Success!')
      }
    })
  }

  addResult (result) {
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

  reply (bot, message, text, attachments) {
    bot.reply(message, {
      text: text,
      attachments: attachments
    })
  }

  replyInteractive (bot, message, title, body, imageUrl, titleUrl) {
    if (titleUrl) {
      title = '<' + titleUrl + '|' + title + '>'
    }

    bot.replyInteractive(message, {
      attachments: [
        {
          title: title,
          text: body,
          thumb_url: imageUrl
        }
      ]
    }, function (err, res) {
      if (err) {
        console.log('Error sending reply:', err)
      }
    })
  }

  parseCallbackResponse (message) {
    return {
      callback_id: message.callback_id,
      cache_key: message.actions[0].value
    }
  }

  get callbackName () {
    return 'interactive_message_callback'
  }

  get events () {
    return 'direct_mention,direct_message'
  }
}
