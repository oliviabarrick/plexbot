var Botkit = require('botkit');

var controller = Botkit.slackbot({});

var bot = controller.spawn({
    token: process.env.SLACK_TOKEN
})

bot.startRTM(function(err, bot, payload) {
    if(err) {
        throw err;
    }

    controller.hears(['^spooky$'], 'direct_mention,direct_message', function(bot, message) {
	      // default behavior, post as the bot user
        bot.startConversation(message, function(err, convo) {
            convo.say('Hello friend :)')
        })
    })
})
