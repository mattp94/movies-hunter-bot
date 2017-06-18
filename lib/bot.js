// *** Imports ***

const path = require('path')

const config = require('./config')
const core = require('./core')
const explorer = require('./explorer')
const logger = require('./logger')
const { LoggedError } = require('./error')



// *** Bot ***

const bot = async () => {
    await core.init()

    const files = await explorer.browse(config.directories, (pathname, stats) => { // Get potential movies
        const ext = path.extname(pathname).replace(/^\./, '').toLowerCase()

        return stats.isFile() && config.extensions.includes(ext)
    })

    const total = files.length

    for (const [index, file] of files.entries()) // Extract data for each movie
        try {
            const result = await core.movie(file) // Add movie and from

            core.duplicate(result) // Add duplicate or nothing
            await Promise.all([core.poster(result), core.trailer(result)]) // Add poster & trailer (true or false)
            await core.insertion(result)

            await logger.success(result, file, index, total)
        } catch (err) {
            if (err instanceof LoggedError)
                await logger.failure(err.message, file, index, total)
            else
                throw err
        }

    await core.flush()
}



// *** Exports ***

module.exports = bot
