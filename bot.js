// *** Libraries ***

var explorer = require('./lib/explorer')
var core = require('./lib/core')
var config = require('./lib/config')
var error = require('./lib/error')

var fs = require('fs-plus')



// *** Bot ***

var files = explorer.browse(config.directories, function (pathname) { // Get potential movies
    return (fs.isFileSync(pathname) || fs.isDirectorySync(pathname)) && config.extensions.length > 0 && new RegExp('\.(' + config.extensions.join('|') + ')$', 'i').test(pathname)
})

files.forEach(function (file) {
    try {
        var result

        result = core.movieHandler(file) // Add movie and from
        result = core.duplicateHandler(result) // Add duplicate or undefined
        result = core.posterHandler(result) // Add poster?
        result = core.trailerHandler(result) // Add trailer?
                 core.insertionHandler(result)
                 core.sleepHandler(result)

        console.log(file.search, result.from, result.poster ? 'poster' : '', result.trailer ? 'trailer' : '', result.duplicate ? 'duplicate' : '')
    } catch (e) {
        if (e instanceof error.LoggedError)
            console.log(e.message)
        else
            throw e
    }
})

core.done() // Flush tmp
