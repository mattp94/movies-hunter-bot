// *** Libraries ***

var explorer = require('./lib/explorer.js')
var api = require('./lib/api.js')



// *** Test ***

// console.log(explorer.browse(['/Users/axa/Desktop/test1', '/Users/axa/Desktop/test2']))
// console.log(api.google('les bronzés allocine', 'fr', 'fr', 5))
console.log(api.allocine(198937))
