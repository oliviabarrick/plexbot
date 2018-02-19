var fetch = require("node-fetch");
var querystring = require("querystring");
var metrics = require("../metrics");

var sonarr = process.env.SONARR_ADDRESS;

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

    var start = Date.now();
    var res = await fetch("http://" + sonarr + "/api/series/lookup?" + qs);
    metrics.api_latency.labels('sonarr').observe(Date.now() - start);

    var json = await res.json();

    console.log(json);

    json.forEach(function(series) {
        series.description = series.overview || "";
        series.tvdbid = series.tvdbId;
        series.imdbid = series.imdbId;
        series.image = series.remotePoster;
    })

    return json;
}

// Create the show.
// throw an error on error, otherwise returns nothing.
module.exports.add = async function(show) {
    show.addOptions = {
        ignoreEpisodesWithFiles: true,
        ignoreEpisodesWithoutFiles: false,
        searchForMissingEpisodes: true
    };
    show.rootFolderPath = process.env.SONARR_ROOT_FOLDER;
    show.profileId = parseInt(process.env.SONARR_PROFILE_ID);

    var res = await fetch("http://" + sonarr + "/api/series?apikey=" + process.env.SONARR_TOKEN, {
        method: 'POST',
        body: JSON.stringify(show),
        headers: { 'Content-Type': 'application/json' },
    });

    var json = await res.json();
    console.log('added show "' + show.title + '"');
    console.log(json);

    if(json.error) {
        throw new Error(json.error);
    }

    if(Array.isArray(json)) {
        json.forEach(function(result) {
            if(result.error || result.errorMessage) {
                throw new Error(result.error || result.errorMessage);
            }
        });
    }

    return true
}
