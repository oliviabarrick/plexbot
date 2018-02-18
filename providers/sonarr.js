var fetch = require("node-fetch");

// Send a query to the provider and return the results as an array.
// A single result item in the array should include:
// * title
// * year
// * imdbid
// * tvdbid
// * description
// * image: a link to the image that can be displayed in-line
// * anything else add() needs to identify it when adding
module.exports.search = function(query) {
    var qs = querystring.stringify({
        term: query,
        apikey: process.env.SONARR_TOKEN
    })

    return fetch("http://sonarr-sonarr.media.svc.cluster.local/api/series/lookup?" + qs).then(function(res) {
        return res.json();
    });
}

// Create the show.
// throw an error on error, otherwise returns nothing.
module.exports.add = function(show) {
    console.log('added show "' + show.title + '"');
    return true
}
