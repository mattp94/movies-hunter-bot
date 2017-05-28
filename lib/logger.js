// *** Imports ***

const chalk = require('chalk')
const fs = require('fs-extra')
const lowdb = require('lowdb')
const moment = require('moment')
const path = require('path')
const percentage = require('percentage')
const storage = require('lowdb/lib/storages/file-async')
const _ = require('lodash')

const config = require('./config')
const utility = require('./utility')



// *** Logger ***

let log

const init = async () => {
    await fs.outputJson(utility.abs(config.locations.log), { // Reset log
        date: new Date(),
        duration: 0,
        failures: [],
        success: []
    })

    log = lowdb(utility.abs(config.locations.log), { storage }) // Load log from json file
}

const success = async (result, file, counter, total) => { // Log a successful movie
    const info = {
        date: new Date(),
        from: result.from,
        duplicate: result.duplicate ? true : false,
        poster: result.poster,
        trailer: result.trailer,
        file: _.pick(file, ['dir', 'base', 'search'])
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
        file: _.pick(file, ['dir', 'base', 'search'])
    }

    await log.get('failures')
             .push(info)
             .write()

    console.error(helpers.date(info.date) + helpers.status(false) + helpers.search(file.search) + helpers.dueTo(error) + helpers.percentage(counter, total))
}

const done = async () => { // Stop the timer
    await log.set('duration', moment().diff(moment(log.get('date').value())))
             .write()
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
