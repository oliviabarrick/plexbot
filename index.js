var Botkit = require('botkit')
var search = require('./search')
var prometheus = require('prom-client')

var triggers = ['^add (tv|movie|radarr) (.*)$']
var events = 'direct_mention,direct_message'

prometheus.collectDefaultMetrics({ timeout: 5000 })

var controller = Botkit.slackbot({
  json_file_store: process.env.PLEXBOT_DATABASE
}).configureSlackApp({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  redirectUri: process.env.SLACK_APP_URL,
  scopes: ['bot']
})

controller.setupWebserver(8889, function (err, expressWebserver) {
  if (err) {
    console.log(err)
    process.exit()
  }

  controller.createWebhookEndpoints(expressWebserver)
  controller.createOauthEndpoints(expressWebserver, function (err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err)
    } else {
      res.send('Success!')
    }
  })

  var metricsCallback = function (req, res) {
    res.set('Content-Type', prometheus.register.contentType)
    res.end(prometheus.register.metrics())
  }

  expressWebserver.get('/', metricsCallback)
  expressWebserver.get('/metrics', metricsCallback)
})

controller.on('create_bot', function (bot, config) {
  bot.startRTM(function (err) {
    if (err) {
      console.log(err)
      process.exit()
    }
  })
})

controller.on('interactive_message_callback', search.interactiveHandler)
controller.hears(triggers, events, search.searchHandler)

controller.storage.teams.all(function (err, teams) {
  if (err) {
    console.log(err)
    process.exit()
  }

  for (var t in teams) {
    if (teams[t].bot) {
      controller.spawn(teams[t]).startRTM(function (err, bot) {
        if (err) {
          console.log('Error connecting bot to Slack:', err)
        }
      })
    }
  }
})
