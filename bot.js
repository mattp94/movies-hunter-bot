// *** Imports ***

const path = require('path')

const config = require('./lib/config')
const core = require('./lib/core')
const explorer = require('./lib/explorer')
const logger = require('./lib/logger')
const { LoggedError } = require('./lib/error')



// *** Bot ***

logger.init()

const files = explorer.browse(config.directories, (pathname, stats) => { // Get potential movies
    const ext = path.extname(pathname).replace(/^\./, '').toLowerCase()

    return stats.isFile() && config.extensions.includes(ext)
})

core.init()

logger.title('Scraping')

for (const [index, file] of files.entries()) // Extract data for each movie
    try {
        let result

        result = core.movie(file) // Add movie and from
        result = core.duplicate(result) // Add duplicate or undefined
        result = core.poster(result) // Add poster (true or false)
        result = core.trailer(result) // Add trailer (true or false)
                 core.insertion(result)
                 core.sleep(result)

        logger.success(result, file, index, files.length)
    } catch (err) {
        if (err instanceof LoggedError)
            logger.failure(err.message, file, index, files.length)
        else
            throw err
    }

core.done()

logger.title('Stats')

logger.done()
