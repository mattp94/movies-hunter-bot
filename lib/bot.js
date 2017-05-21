// *** Imports ***

const path = require('path')

const config = require('./config')
const core = require('./core')
const explorer = require('./explorer')
const logger = require('./logger')
const { LoggedError } = require('./error')



// *** Bot ***

const bot = async () => {
    const files = await explorer.browse(config.directories, (pathname, stats) => { // Get potential movies
        const ext = path.extname(pathname).replace(/^\./, '').toLowerCase()
        return stats.isFile() && config.extensions.includes(ext)
    })

    const total = files.length

    if (total > 0) {
        for (const [index, file] of files.entries()) // Extract data for each movie
            try {
                const result = await core.movie(file) // Add movie and from

                core.duplicate(result) // Add duplicate or nothing
                await Promise.all([core.poster(result), core.trailer(result)]) // Add poster & trailer (true or false)
                core.insertion(result)
                await core.wait(result)

                logger.success(result, file, index, total)
            } catch (err) {
                if (err instanceof LoggedError)
                    logger.failure(err.message, file, index, total)
                else
                    throw err
            }

        await core.done()
    }

    logger.done()
}



// *** Exports ***

module.exports = bot
