var prometheus = require('prom-client');

var searches_count = new prometheus.Counter({
  name: 'searches',
  help: 'number of searches performed',
  labelNames: ['type']
});

var providers = {
    'tv': require('./providers/sonarr'),
    'movie': require('./providers/couchpotato'),
}

function create_attachment(result) {
    return {
        title: '<http://www.imdb.com/title/' + result.imdbid + "|" + result.title + "> (" + result.year + ")",
        text: result.description.slice(0, 250) + "...",
        thumb_url: result.image,
        name: result.title,
        actions: [
            {
                name: 'Add show',
                text: 'Add show',
                value: result.tvdbid,
                type: 'button'
            }
        ]
    };
};

module.exports.searchHandler = async function(bot, message) {
    var type = message.match[1];
    var search = message.match[2];

    var attachments = [];
    var callbacks = [];

    searches_count.labels(type).inc();

    providers[type].search(search).then(function(results) {
        results.forEach(function(result) {
            attachments.push(create_attachment(result));

            callbacks.push({
                pattern: result.tvdbid,
                callback: function(reply, convo) {
                    convo.say("response?");
                    console.log("my callback");
                }
            })
        });

        bot.startConversation(message, function(err, convo) {
            convo.ask({ attachments: attachments }, callbacks);
        });
    });
}
