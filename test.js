// *** Libraries ***

var explorer = require('./lib/explorer.js')
var api = require('./lib/api.js')
var extractor = require('./lib/extractor.js')



// *** Test ***

// console.log(explorer.browse(['/Users/matthieu/Desktop/mh_tests/test1', '/Users/matthieu/Desktop/mh_tests/test2']))
// console.log(api.google('les bronzés allocine', 'fr', 'fr', 5))
// console.log(JSON.stringify(api.allocine(204027)))
// console.log(extractor.allocine.getCodes('les bronzés'))

var codes = extractor.allocine.getCodes('LA GLACE ET LE CIEL')
console.log(codes)

var movie = extractor.allocine.getData(codes[0])
console.log(movie)

extractor.downloadPoster(movie)