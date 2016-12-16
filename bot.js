// *** Libraries ***

const explorer = require('./lib/explorer')
const core = require('./lib/core')
const config = require('./lib/config')
const error = require('./lib/error')
const logger = require('./lib/logger')

const fs = require('fs')



// *** Bot ***

logger.init()

const files = explorer.browse(config.directories, pathname => { // Get potential movies
    const stats = fs.statSync(pathname)

    return (stats.isFile() && config.extensions.file.length > 0 && new RegExp('\.(' + config.extensions.file.join('|') + ')$', 'i').test(pathname))
        || (stats.isDirectory() && config.extensions.directory.length > 0 && new RegExp('\.(' + config.extensions.directory.join('|') + ')$', 'i').test(pathname))
})

core.init()

for (const [index, file] of files.entries()) // Extract data for each movie
    try {
        let result

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

core.done()

logger.done()
