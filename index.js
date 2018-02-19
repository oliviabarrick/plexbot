var Botkit = require('botkit');
var search = require('./search');
var prometheus = require('prom-client');

var triggers = ['^add (tv|movie) (.*)$'];
var events = 'direct_mention,direct_message';

prometheus.collectDefaultMetrics({ timeout: 5000 });

var controller = Botkit.slackbot({});

controller.setupWebserver(8889, function(err, express_webserver) {
    controller.createWebhookEndpoints(express_webserver)

    var metrics_callback = function(req, res) {
        res.set('Content-Type', prometheus.register.contentType);
        res.end(prometheus.register.metrics());
    };

    express_webserver.get('/', metrics_callback);
    express_webserver.get('/metrics', metrics_callback);
});

var bot = controller.spawn({
    token: process.env.SLACK_TOKEN
});

bot.startRTM(function(err, bot, payload) {
    if(err) {
        throw err;
    }

    controller.hears(triggers, events, search.searchHandler);
});
