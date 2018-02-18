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

module.exports.searchHandler = function(bot, message) {
    var type = message.match[1];
    var search = message.match[2];

    providers[type].search(search).then(function(results) {
        var attachments = [];
        var options = {}

        results.forEach(function(result) {
            options[result.tvdbid] = result;
            attachments.push(create_attachment(result));
        });

        bot.startConversation(message, function(err, convo) {
            convo.ask({
                attachments: attachments,
            }, [
                {
                    default: true,
                    callback: function(reply, convo) {
                    }
                }
            ]);
        });
    })
}
