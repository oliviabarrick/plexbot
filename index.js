var Botkit = require('botkit')
var Slack = require('./messengers/slack')
var Facebook = require('./messengers/facebook')
var prometheus = require('prom-client')

prometheus.collectDefaultMetrics({ timeout: 5000 })

Botkit.core({}).setupWebserver(8889, function (err, webserver) {
  if (err) {
    console.log(err)
    process.exit(1)
  }

  var metricsCallback = function (req, res) {
    res.set('Content-Type', prometheus.register.contentType)
    res.end(prometheus.register.metrics())
  }

  webserver.get('/', metricsCallback)
  webserver.get('/metrics', metricsCallback)

  if (process.env.FACEBOOK_ACCESS_TOKEN) {
    console.log('Setting up Facebook.')
    var facebook = new Facebook()
    facebook.setup(webserver)
  }

  if (process.env.SLACK_CLIENT_ID) {
    console.log('Setting up Slack.')
    var slack = new Slack()
    slack.setup(webserver)
  }
})
