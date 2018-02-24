var metrics = require('./metrics');
var args = require('./args');
var cache = require('memory-cache');

var providers = {
    'tv': require('./providers/sonarr'),
    'movie': require('./providers/couchpotato'),
    'radarr': require('./providers/radarr')
}

var create_attachment = function(result) {
    var actions = [];

    if(!result.already_added) {
        actions.push({
            name: 'Add',
            text: 'Add',
            value: result.imdbid,
            type: 'button'
        });
    } else {
        actions.push({
            name: 'Already added',
            text: 'Already added',
            value: result.imdbid,
            type: 'button'
        });
    }

    return {
        title: '<http://www.imdb.com/title/' + result.imdbid + "|" + result.title + "> (" + result.year + ")",
        text: result.description.slice(0, 250) + "...",
        thumb_url: result.image,
        name: result.title,
        callback_id: 'add_show',
        actions: actions
    };
};

var add_show = function(bot, message) {
    var to_add = cache.get(message.actions[0].value);

    if(to_add == null) {
        bot.replyInteractive(message, "unknown callback");
    }

    metrics.added_count.labels(to_add.type).inc();

    if(to_add.already_added) {
        bot.replyInteractive(message, {
            attachments: [
                {
                    title: "<" + to_add.provider_url + "|"  + to_add.title + "> is already added!",
                    text: to_add.description.slice(0, 250) + "...",
                    thumb_url: to_add.image
                }
            ]
        });

        return;
    }

    providers[to_add.type].add(to_add).then(function(res) {
        bot.replyInteractive(message, {
            attachments: [
                {
                    title: "Added <" + to_add.provider_url + "|"  + to_add.title + ">!",
                    text: to_add.description.slice(0, 250) + "...",
                    thumb_url: to_add.image
                }
            ]
        });
    }).catch(function(err) {
        bot.replyInteractive(message, {
            text: "Failed to add <" + to_add.provider_url + "|"  + to_add.title + ">! " + err,
        });
    });
};

var callbacks = {
    'add_show': add_show
};

module.exports.interactiveHandler = function(bot, message) {
    callbacks[message.callback_id](bot, message);
};

module.exports.searchHandler = function(bot, message) {
    var type = message.match[1];
    var args = message.match[2];

    args = argparser.parse(args);

    metrics.searches_count.labels(type).inc();

    providers[type].search(args.search, args).then(function(results) {
        var attachments = [];

        results.forEach(function(result) {
            attachments.push(create_attachment(result));
            result.type = type;
            cache.put(result.imdbid, result, 600000);
        });

        bot.reply(message, {
            text: 'Your results for "' + search + '":',
            attachments: attachments
        });
    });

    metrics.completed_searches_count.labels(type).inc();
};
