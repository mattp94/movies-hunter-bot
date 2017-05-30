// *** Imports ***

const path = require('path')

const config = require('./config')
const core = require('./core')
const explorer = require('./explorer')
const logger = require('./logger')
const { LoggedError } = require('./error')



// *** Bot ***

let counter

const bot = async () => {
    counter = 0

    await logger.init()
    await core.init()

    const files = await explorer.browse(config.directories, (pathname, stats) => { // Get potential movies
        const ext = path.extname(pathname).replace(/^\./, '').toLowerCase()
        return stats.isFile() && config.extensions.includes(ext)
    })

    for (let i = 0, total = files.length; i < total; i += config.parallel)
        await Promise.all(files.slice(i, i + config.parallel).map(file => coreTask(file, total)))

    await core.flush()
    await logger.done()
}

const coreTask = async (file, total) => {
    try {
        const result = await core.movie(file) // Add movie and from

        core.duplicate(result) // Add duplicate or nothing
        await Promise.all([core.poster(result), core.trailer(result)]) // Add poster & trailer (true or false)
        await core.insertion(result)

        await logger.success(result, file, counter++, total)
    } catch (err) {
        if (err instanceof LoggedError)
            await logger.failure(err.message, file, counter++, total)
        else
            throw err
    }
}



// *** Exports ***

module.exports = bot
