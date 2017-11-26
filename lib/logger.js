// *** Imports ***

const chalk = require('chalk')
const FileAsync = require('lowdb/adapters/FileAsync')
const fs = require('fs-extra')
const lowdb = require('lowdb')
const moment = require('moment')
const path = require('path')
const percentage = require('percentage')
const { pick } = require('lodash')

const config = require('./config')
const utility = require('./utility')



// *** Logger ***

let log

const init = async (date, version) => {
    await fs.ensureDir(utility.abs(path.dirname(config.locations.log)))

    const adapter = new FileAsync(utility.abs(config.locations.log)) // Async operations
    log = await lowdb(adapter) // Load log from json file

    await log.setState({ // Reset log
        version,
        date,
        duration: 0,
        failures: [],
        success: []
    })

    console.log(chalk.gray(`Movies-Hunter Bot v${version}`))
    console.log(chalk.gray('Launched on ') + moment(date).format('dddd, MMMM Do YYYY') + chalk.gray(' at ') + moment(date).format('HH:mm:ss'))
    console.log(chalk.gray('---'))
}

const success = async (result, file, counter, total) => { // Log a successful movie
    const info = {
        date: new Date(),
        from: result.from,
        duplicate: result.duplicate ? true : false,
        poster: result.poster,
        trailer: result.trailer,
        file: pick(file, ['dir', 'base', 'search'])
    }

    await log.get('success')
             .push(info)
             .write()

    console.log(helpers.date(info.date) + helpers.status(true) + helpers.search(file.search) + helpers.from(result.from) + helpers.with(result.poster, result.trailer) + helpers.but(result.duplicate) + helpers.percentage(counter, total))
}

const failure = async (error, file, counter, total) => { // Log a failed movie
    const info = {
        date: new Date(),
        error,
        file: pick(file, ['dir', 'base', 'search'])
    }

    await log.get('failures')
             .push(info)
             .write()

    console.error(helpers.date(info.date) + helpers.status(false) + helpers.search(file.search) + helpers.dueTo(error) + helpers.percentage(counter, total))
}

const done = async date => { // Stop the timer
    const duration = new Date() - date

    await log.set('duration', duration)
             .write()

    console.log(chalk.gray('---'))
    console.log(duration + chalk.gray(' ms'))
}

const helpers = { // String helpers for printing in the console
    date: date => `${moment(date).format('YYYY-MM-DD HH:mm:ss')} `, // Print '2016-11-29 22:34:10 '

    status: success => success ? chalk.bgGreen('+') : chalk.bgRed('-'), // Print '+' or '-'

    search: search => chalk.gray(' [') + chalk.bold(search) + chalk.gray(']'), // Print ' [Her 2015]'

    from: from => chalk.gray(' from [') + chalk.green(from) + chalk.gray(']'), // Print ' from [api/allocine]'

    dueTo: message => chalk.gray(' due to [') + chalk.red(message) + chalk.gray(']'), // Print ' due to [extractor/thumbnail]'

    with: (poster, trailer) => { // Print ' with [poster, trailer]'
        const pt = []

        if (poster)
            pt.push(chalk.blue('poster'))

        if (trailer)
            pt.push(chalk.magenta('trailer'))

        return pt.length > 0 ? chalk.gray(' with [') + pt.join(chalk.gray(', ')) + chalk.gray(']') : ''
    },

    but: duplicate => duplicate ? chalk.gray(' but [') + chalk.yellow('duplicate') + chalk.gray(']') : '', // Print ' but [duplicate]'

    percentage: (counter, total) => ` ${chalk.inverse(percentage((counter + 1) / total, config.percentage))}` // Print ' 97.31%'
}



// *** Exports ***

module.exports = {
    init,
    success,
    failure,
    done
}
