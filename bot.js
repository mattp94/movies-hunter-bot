// *** Libraries ***

var explorer = require('./lib/explorer.js')
var core = require('./lib/core.js')
var config = require('./lib/config.js')

var fs = require('fs')



// *** Bot ***

var files = explorer.browse(config.directories, function (pathname) { // Get potential movies
    var stats = fs.statSync(pathname)
    
    return (stats.isFile() || stats.isDirectory()) && config.extensions.length > 0 && new RegExp('\.(' + config.extensions.join('|') + ')$', 'i').test(pathname)
})

files.forEach(function (file) {
    var result

    result = core.movieHandler(file) // Add movie and from
    result = core.duplicateHandler(result) // Add duplicate or undefined
    result = core.posterHandler(result) // Add poster?
    result = core.trailerHandler(result) // Add trailer?
             core.insertionHandler(result)
             core.sleepHandler(result)

    console.log(file.search, result.from, result.poster ? 'poster' : '', result.trailer ? 'trailer' : '', result.duplicate ? 'duplicate' : '')
})

core.done()
