// *** Libraries ***

var explorer = require('./lib/explorer.js')
var api = require('./lib/api.js')
var extractor = require('./lib/extractor.js')
var core = require('./lib/core.js')



// *** Test ***

// console.log(explorer.browse(['/Users/matthieu/Desktop/mymovies/']))
// console.log(api.google('les bronzés allocine', 'fr', 'fr', 5))
// console.log(JSON.stringify(api.allocine(204027)))
// console.log(extractor.allocine.getCodes('les bronzés'))

// var codes = extractor.allocine.getCodes('Her')
// console.log(codes)
//
// var movie = extractor.allocine.getData(codes[0])
// console.log(movie)
//
// extractor.savePoster(movie)

var folders = explorer.browse(['/Users/matthieu/Desktop/mymovies/'])

folders.forEach(function (folder) {
    var result

    result = core.movieHandler(folder) // return movie and from
    result = core.duplicateHandler(result) // return duplicate or undefined
    result = core.posterHandler(result) // return poster?
             core.insertionHandler(result)
             core.sleepHandler(result)

    console.log(folder.search, result.from, result.poster ? 'poster' : '', result.duplicate ? 'duplicate' : '')
    // console.log(require('util').inspect(result.movie, {depth: 1}));
})

core.done()
