// *** Imports ***

const bot = require('./lib/bot')
const logger = require('./lib/logger')

const { version } = require('./package.json')



// *** Main ***

const main = async () => {
    const date = new Date()

    await logger.init(date, version)
    await bot()
    await logger.done(date)
}

main().catch(err => {
    console.log(err)
    process.exit(1)
})
