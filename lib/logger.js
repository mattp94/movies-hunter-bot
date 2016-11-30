// *** Libraries ***

const utility = require('./utility')
const config = require('./config')

const fs = require('fs-plus')
const path = require('path')
const lowdb = require('lowdb')
const chalk = require('chalk')
const moment = require('moment')
const _ = require('lodash')
const percentage = require('percentage')



// *** Logger ***

fs.makeTreeSync(path.dirname(utility.absolute(config.locations.log))) // Create directory if not exists

const log = lowdb(utility.absolute(config.locations.log)) // Load log from json file

const init = () => { // Initialize log (reset log, starting date)
    const date = new Date()
    const version = require(utility.absolute('./package.json')).version

    console.log(chalk.gray('Movies-Hunter Bot v' + version + ' by mattp94\nLaunched on ') + moment(date).format('dddd, MMMM Do YYYY') + chalk.gray(' at ') + moment(date).format('HH:mm:ss') + chalk.gray('\n\n--- Scraping ---'))

    log.setState({ // Reset log
        date,
        stats: {
            success: 0,
            failures: 0,
            movies: 0,
            duplicates: 0
        },
        failures: [],
        success: []
    })
}

const success = (result, file, index, total) => { // Log a successful movie
    const date = new Date()

    console.log(helper.date(date) + helper.status(true) + helper.search(file.search) + helper.from(result.from) + helper.with(result.poster, result.trailer) + helper.but(result.duplicate) + helper.percentage(index, total))

    log.get('success').push({
        date,
        from: result.from,
        duplicate: result.duplicate ? true : false,
        poster: result.poster,
        trailer: result.trailer,
        file: _.pick(file, ['dir', 'base', 'search'])
    }).value()

    log.update('stats.success', n => n + 1).value()

    if (result.duplicate)
        log.update('stats.duplicates', n => n + 1).value()
    else
        log.update('stats.movies', n => n + 1).value()
}

const failure = (error, file, index, total) => { // Log a failed movie
    const date = new Date()

    console.error(helper.date(date) + helper.status(false) + helper.search(file.search) + helper.dueTo(error) + helper.percentage(index, total))

    log.get('failures').push({
        date,
        error,
        file: _.pick(file, ['dir', 'base', 'search'])
    }).value()

    log.update('stats.failures', n => n + 1).value()
}

const done = () => { // Display stats and get process' duration
    console.log(chalk.gray('\n--- Stats ---') + helper.stat('Success', log.get('stats.success').value(), 'green') + helper.stat('Failures', log.get('stats.failures').value(), 'red') + helper.stat('Movies', log.get('stats.movies').value(), 'blue') + helper.stat('Duplicates', log.get('stats.duplicates').value(), 'yellow'))

    log.set('duration', new Date() - log.get('date').value()).value()
}

const helper = { // String helper for printing in the console
    arrow: () => chalk.gray(' > '), // Print ' > '

    date: date => moment(date).format('YYYY-MM-DD HH:mm:ss'), // Print '2016-11-29 22:34:10'

    status: success => success ? helper.arrow() + chalk.bgGreen('(+)') : helper.arrow() + chalk.bgRed('(-)'), // Print ' > (+)'

    search: search => chalk.gray(' {') + chalk.bold(search) + chalk.gray('}'), // Print '{Her 2015}'

    from: from => chalk.gray(' from [') + chalk.green(from) + chalk.gray(']'), // Print ' from [api/allocine]'

    dueTo: message => chalk.gray(' due to [') + chalk.red(message) + chalk.gray(']'), // Print ' due to [extractor/saveThumbnail]'

    with: (poster, trailer) => { // Print ' with [poster, trailer]'
        const pt = []

        if (poster)
            pt.push(chalk.blue('poster'))

        if (trailer)
            pt.push(chalk.magenta('trailer'))

        return pt.length > 0 ? chalk.gray(' with [' + pt.join(', ') + ']') : ''
    },

    but: duplicate => duplicate ? chalk.gray(' but [' + chalk.yellow('duplicate') + ']') : '', // Print ' but [duplicate]'

    percentage: (index, total) => helper.arrow() + chalk.inverse(percentage((index + 1) / total, config.percentage)), // Print ' > 99.3%'

    stat: (title, value, color) => '\n' + chalk[color](title) + helper.arrow() + value // Print 'Success > 4'
}


// *** Exports ***

module.exports = {
    init,
    success,
    failure,
    done
}
