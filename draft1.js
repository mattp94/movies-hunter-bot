// *** Libraries ***

var explorer = require('./lib/explorer.js')
var api = require('./lib/api.js')
var extractor = require('./lib/extractor.js')
var core = require('./lib/core.js')

var fs = require('fs')
var path = require('path')



// *** Draft 1 ***

// console.log(explorer.browse(['/Users/matthieu/Desktop/basicmovies']))
// console.log(api.google('les bronzés allocine', 'fr', 'fr', 5))
// console.log(JSON.stringify(api.allocine(204027)))
// console.log(extractor.allocine.getCodes('les bronzés'))
//
// var codes = extractor.allocine.getCodes('Her')
// console.log(codes)
//
// var movie = extractor.allocine.getData(codes[0])
// console.log(movie)
//
// extractor.savePoster(movie)
