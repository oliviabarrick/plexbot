var Botkit = require('botkit');
var search = require('./search');
var prometheus = require('prom-client');

var triggers = ['^add (tv|movie) (.*)$'];
var events = 'direct_mention,direct_message';

prometheus.collectDefaultMetrics({ timeout: 5000 });

var controller = Botkit.slackbot({
    json_file_store: './db_slackbutton_bot/',
}).configureSlackApp({
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    redirectUri: process.env.SLACK_APP_URL,
    scopes: ['bot'],
});

controller.setupWebserver(8889, function(err, express_webserver) {
    controller.createWebhookEndpoints(express_webserver)
    controller.createOauthEndpoints(express_webserver, function(err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });

    var metrics_callback = function(req, res) {
        res.set('Content-Type', prometheus.register.contentType);
        res.end(prometheus.register.metrics());
    };

    express_webserver.get('/', metrics_callback);
    express_webserver.get('/metrics', metrics_callback);
});

controller.on('create_bot', function(bot, config) {
    bot.startRTM(function(err) {});
});

controller.hears(triggers, events, search.searchHandler);

controller.storage.teams.all(function(err, teams) {
    for (var t in teams) {
        if (teams[t].bot) {
            controller.spawn(teams[t]).startRTM(function(err, bot) {
                if (err) {
                    console.log('Error connecting bot to Slack:',err);
                }
            });
       }
    }
});
