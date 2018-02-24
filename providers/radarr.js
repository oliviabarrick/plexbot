var fetch = require("node-fetch");
var querystring = require("querystring");
var metrics = require("../metrics");

var ranarr = process.env.RADARR_ADDRESS;

// Send a query to the provider and return the results as an array.
// A single result item in the array should include:
// * title
// * year
// * imdbid
// * tvdbid
// * description
// * image: a link to the image that can be displayed in-line
// * provider_url: link to resource in sonarr
// * anything else add() needs to identify it when adding
module.exports.search = async function(query) {
    var qs = querystring.stringify({
        term: query,
        apikey: process.env.RADARR_TOKEN
    })

    var start = Date.now();
    var res = await fetch("http://" + sonarr + "/api/movie/lookup?" + qs);
    metrics.api_latency.labels('radarr').observe(Date.now() - start);

    var json = await res.json();

    json.forEach(function(movie) {
        movie.description = movie.overview || "";
        movie.imdbid = movie.tmdbId;
        movie.image = movie.remotePoster;
        movie.provider_url = process.env.RADARR_PUBLIC + "/movies/" + movie.titleSlug;
    })

    return json;
}

// Create the show.
// throw an error on error, otherwise returns nothing.
module.exports.add = async function(movie) {
    movie.rootFolderPath = process.env.RADARR_ROOT_FOLDER;
    movie.profileId = parseInt(process.env.RADARR_PROFILE_ID);

    var res = await fetch("http://" + radarr + "/api/movie?apikey=" + process.env.RADARR_TOKEN, {
        method: 'POST',
        body: JSON.stringify(movie),
        headers: { 'Content-Type': 'application/json' },
    });

    var json = await res.json();
    console.log('added movie "' + movie.title + '"');

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
