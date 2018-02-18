var Botkit = require('botkit');
var search = require('./search');

var triggers = ['^add (tv|movie) (.*)$'];
var events = 'direct_mention,direct_message';

var controller = Botkit.slackbot({});

var bot = controller.spawn({
    token: process.env.SLACK_TOKEN
});

bot.startRTM(function(err, bot, payload) {
    if(err) {
        throw err;
    }

    controller.hears(triggers, events, search.searchHandler);
});
