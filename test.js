// *** Libraries ***

var explorer = require('./lib/explorer.js')
var api = require('./lib/api.js')
var extractor = require('./lib/extractor.js')
var core = require('./lib/core.js')

var sleep = require('thread-sleep')



// *** Test ***

// console.log(explorer.browse(['/Users/matthieu/Desktop/mymovies/']))
// console.log(api.google('les bronzés allocine', 'fr', 'fr', 5))
// console.log(JSON.stringify(api.allocine(204027)))
// console.log(extractor.allocine.getCodes('les bronzés'))

// var codes = extractor.allocine.getCodes('Barbecue')
// console.log(codes)
//
// var movie = extractor.allocine.getData(codes[0])
// console.log(movie)
//
// extractor.savePoster(movie)

var folders = explorer.browse(['/Users/matthieu/Desktop/mymovies/'])

folders.forEach(function (folder) {
    var res = core.movieHandler(folder)
    core.insertionHandler(res.movie)

    console.log(folder.search, res.from)
    sleep(2000)
})

core.done()
