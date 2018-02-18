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
    return [
        {
            title: "The Blacklist", year: "1994", imdbid: "tt2741602", tvdbid: "12345",
            image: "http://thetvdb.com/banners/posters/266189-14.jpg",
            description: "Raymond \"Red\" Reddington, one of the FBI's most wanted fugitives, surrenders in person at FBI Headquarters in Washington, D.C. He claims that he and the FBI have the same interests: bringing down dangerous criminals and terrorists. In the last two decades, he's made a list of criminals and terrorists that matter the most but the FBI cannot find because it does not know they exist. Reddington calls this \"The Blacklist\".\nReddington will co-operate, but insists that he will speak only to Elizabeth Keen, a rookie FBI profiler.",
        },
        {
            title: "Cutthroat Kitchen", year: "1997", imdbid: "tt2930446", tvdbid: "12345",
            image: "https://www.thetvdb.com/banners/posters/271613-1.jpg",
            description: "Just how far is a chef willing to go to win a cooking competition? Cutthroat Kitchen hands four chefs each $25,000 and the opportunity to spend that money on helping themselves or sabotaging their competitors. Ingredients will be thieved, utensils destroyed and valuable time on the clock lost when the chefs compete to cook delicious dishes while also having to outplot the competition. With Alton Brown as the devilish provocateur, nothing is out of bounds when money changes hands and we see just how far chefs will go to ensure they have the winning dish."
        }
    ];
}

// Create the show.
// throw an error on error, otherwise returns nothing.
module.exports.add = function(show) {
    console.log('added show "' + show.title + '"');
    return true
}
