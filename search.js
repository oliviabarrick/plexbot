var metrics = require('./metrics');

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
        callback_id: 'add_show',
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

module.exports.searchHandler = function(bot, message) {
    var type = message.match[1];
    var search = message.match[2];

    metrics.searches_count.labels(type).inc();

    bot.startConversation(message, function(err, convo) {
        providers[type].search(search).then(function(results) {
            var attachments = [];
            var callbacks = [];

            results.forEach(function(result) {
                attachments.push(create_attachment(result));

                callbacks.push({
                    pattern: result.tvdbid,
                    callback: function(reply, convo) {
                        metrics.added_count.labels(type).inc();
                        providers[type].add(result).then(function(res) {
                            convo.gotoThread(result.tvdbid);
                        }).catch(function(err) {
                            convo.setVar("error", err);
                            convo.gotoThread(result.tvdbid + "_error");
                        });
                    }
                });

                convo.addMessage({
                    text: "Added " + result.title + "!"
                }, result.tvdbid);

                convo.addMessage({
                    text: "Failed to add " + result.title + "! {{ vars.error }}"
                }, result.tvdbid + "_error");
            });

            convo.addQuestion({ attachments: attachments }, callbacks);
            convo.activate();
        });
    });

    metrics.completed_searches_count.labels(type).inc();
};
