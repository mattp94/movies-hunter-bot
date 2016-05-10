// *** Libraries declaration ***

var Explorer = require('./components/Explorer.js')
var Extractor = require('./components/Extractor.js')



// *** Test ***

var explorer = new Explorer()
// console.log(explorer.browse(['/Users/axa/Desktop/test1', '/Users/axa/Desktop/test2']))

var extractor = new Extractor()
// console.log(extractor.test('les bronzés allocine', 'fr', 'fr', 5))
extractor.test(143067)