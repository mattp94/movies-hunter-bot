// *** Imports ***

const chalk = require('chalk')
const fs = require('fs-extra')
const lowdb = require('lowdb')
const moment = require('moment')
const path = require('path')
const percentage = require('percentage')
const _ = require('lodash')

const config = require('./config')
const utility = require('./utility')



// *** Logger ***

fs.ensureDirSync(utility.absolute(path.dirname(config.locations.log)))

const log = lowdb(utility.absolute(config.locations.log)) // Load log from json file

log.setState({ // Reset log
    date: new Date(),
    duration: 0,
    stats: { success: 0, failures: 0, movies: 0, duplicates: 0 },
    failures: [],
    success: []
})

const success = (result, file, index, total) => { // Log a successful movie
    const info = {
        date: new Date(),
        from: result.from,
        duplicate: result.duplicate ? true : false,
        poster: result.poster,
        trailer: result.trailer,
        file: _.pick(file, ['dir', 'base', 'search'])
    }

    log.get('success')
       .push(info)
       .write()

    log.update('stats.success', n => n + 1)
       .write()

    if (result.duplicate)
        log.update('stats.duplicates', n => n + 1)
           .write()
    else
        log.update('stats.movies', n => n + 1)
           .write()

    console.log(helpers.date(info.date) + helpers.status(true) + helpers.search(file.search) + helpers.from(result.from) + helpers.with(result.poster, result.trailer) + helpers.but(result.duplicate) + helpers.percentage(index, total))
}

const failure = (error, file, index, total) => { // Log a failed movie
    const info = {
        date: new Date(),
        error,
        file: _.pick(file, ['dir', 'base', 'search'])
    }

    log.get('failures')
       .push(info)
       .write()

    log.update('stats.failures', n => n + 1)
       .write()

    console.error(helpers.date(info.date) + helpers.status(false) + helpers.search(file.search) + helpers.dueTo(error) + helpers.percentage(index, total))
}

const done = () => { // Stop the timer
    log.set('duration', new Date() - log.get('date').value())
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

    percentage: (index, total) => ` ${chalk.inverse(percentage((index + 1) / total, config.percentage))}` // Print ' 97.31%'
}



// *** Exports ***

module.exports = {
    success,
    failure,
    done
}
