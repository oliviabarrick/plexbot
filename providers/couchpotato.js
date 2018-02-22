var fetch = require("node-fetch");
var querystring = require("querystring");
var metrics = require("../metrics");

var couchpotato = process.env.COUCHPOTATO_ADDRESS;

const couchbase = "http://" + couchpotato + "/api/" + process.env.COUCHPOTATO_TOKEN + "/";

// Send a query to the provider and return the results as an array.
// A single result item in the array should include:
// * title
// * year
// * imdbid
// * description
// * image: a link to the image that can be displayed in-line
// * provider_url: link to resource in sonarr
// * anything else add() needs to identify it when adding
module.exports.search = async function(query) {
    var qs = querystring.stringify({
        q: query,
    });

    var start = Date.now();
    var res = await fetch(couchbase + "search?" + qs);
    metrics.api_latency.labels('couchpotato').observe(Date.now() - start);

    var json = await res.json();

    json.movies.forEach(function(movie) {
        movie.title = movie.original_title;
        movie.description = movie.plot || "";
        movie.imdbid = movie.imdb;
        if(movie.images.poster_original) {
            movie.image = movie.images.poster_original[0];
        }
        movie.provider_url = process.env.COUCHPOTATO_PUBLIC + "/" + movie.title;
        movie.already_added = (movie.in_library || movie.in_wanted) ? true : false;
    });

    return json.movies;
}

// Create the show.
// throw an error on error, otherwise returns nothing.
module.exports.add = async function(movie) {
    var qs = querystring.stringify({
        title: movie.title,
        identifier: movie.imdbid,
        force_readd: false
    });

    var res = await fetch(couchbase + "movie.add?" + qs);
    var json = await res.json();

    if(json.success == true) {
        return true
    } else {
        throw new Error("Could not add movie! " + JSON.stringify(json));
    }
}
