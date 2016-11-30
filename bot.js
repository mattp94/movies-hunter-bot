// *** Libraries ***

var explorer = require('./lib/explorer')
var core = require('./lib/core')
var config = require('./lib/config')
var error = require('./lib/error')
var logger = require('./lib/logger')

var fs = require('fs-plus')



// *** Bot ***

logger.init()

var files = explorer.browse(config.directories, function (pathname) { // Get potential movies
    return (fs.isFileSync(pathname) || fs.isDirectorySync(pathname)) && config.extensions.length > 0 && new RegExp('\.(' + config.extensions.join('|') + ')$', 'i').test(pathname)
})

files.forEach(function (file, index) { // Scrap data for each movie
    try {
        var result

        result = core.movieHandler(file) // Add movie and from
        result = core.duplicateHandler(result) // Add duplicate or undefined
        result = core.posterHandler(result) // Add poster (true or false)
        result = core.trailerHandler(result) // Add trailer (true or false)
                 core.insertionHandler(result)
                 core.sleepHandler(result)

        logger.success(result, file, index, files.length)
    } catch (e) {
        if (e instanceof error.LoggedError)
            logger.failure(e.message, file, index, files.length)
        else
            throw e
    }
})

core.flushHandler() // Flush tmp

logger.done()
