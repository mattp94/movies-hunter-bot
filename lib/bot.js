// *** Imports ***

const path = require('path')

const config = require('./config')
const core = require('./core')
const explorer = require('./explorer')
const logger = require('./logger')
const { LoggedError } = require('./error')



// *** Bot ***

const bot = async () => {
    logger.init()

    const files = await explorer.browse(config.directories, (pathname, stats) => { // Get potential movies
        const ext = path.extname(pathname).replace(/^\./, '').toLowerCase()
        return stats.isFile() && config.extensions.includes(ext)
    })

    await core.init()

    logger.title('Scraping')

    for (const [index, file] of files.entries()) // Extract data for each movie
        try {
            const result = await core.movie(file) // Add movie and from

            core.duplicate(result) // Add duplicate or undefined
            await core.poster(result) // Add poster (true or false)
            await core.trailer(result) // Add trailer (true or false)
            core.insertion(result)
            await core.wait(result)

            logger.success(result, file, index, files.length)
        } catch (err) {
            if (err instanceof LoggedError)
                logger.failure(err.message, file, index, files.length)
            else
                throw err
        }

    await core.done()

    logger.title('Stats')

    logger.done()
}



// *** Exports ***

module.exports = bot
