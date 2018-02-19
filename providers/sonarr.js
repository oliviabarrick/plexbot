var fetch = require("node-fetch");
var querystring = require("querystring");

// var sonarr = "127.0.0.1:8080";
var sonarr = "sonarr-sonarr.media.svc.cluster.local";

// Send a query to the provider and return the results as an array.
// A single result item in the array should include:
// * title
// * year
// * imdbid
// * tvdbid
// * description
// * image: a link to the image that can be displayed in-line
// * anything else add() needs to identify it when adding
module.exports.search = async function(query) {
    var qs = querystring.stringify({
        term: query,
        apikey: process.env.SONARR_TOKEN
    })

    var res = await fetch("http://" + sonarr + "/api/series/lookup?" + qs);

    console.log("sent search");

    var json = await res.json();

    console.log(json);

    json.forEach(function(series) {
        series.description = series.overview;
        series.tvdbid = series.tvdbId;
        series.imdbid = series.imdbId;
        series.image = series.remotePoster;
    })

    return json;
}

// Create the show.
// throw an error on error, otherwise returns nothing.
module.exports.add = function(show) {
    console.log('added show "' + show.title + '"');
    return true
}
