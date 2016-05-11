// *** Libraries declaration ***

var Explorer = require('./components/Explorer.js')
var API = require('./components/API.js')



// *** Test ***

var explorer = new Explorer()
// console.log(explorer.browse(['/Users/axa/Desktop/test1', '/Users/axa/Desktop/test2']))

var api = new API()
// console.log(API.google('les bronzés allocine', 'fr', 'fr', 5))
console.log(api.allocine(198937))