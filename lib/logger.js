// *** Libraries ***

const utility = require('./utility')
const config = require('./config')

const lowdb = require('lowdb')
const chalk = require('chalk')
const moment = require('moment')
const _ = require('lodash')
const percentage = require('percentage')



// *** Logger ***

const log = lowdb(utility.absolute(config.locations.log)) // Load log from json file

const init = () => { // Initialize log (reset log, starting date)
    const date = new Date()
    const {version, author: {name}} = require(utility.absolute('./package.json'))

    console.log(chalk.gray(`Movies-Hunter Bot v${version} by ${name}`))
    console.log(chalk.gray(`Launched on `) + moment(date).format('dddd, MMMM Do YYYY') + chalk.gray(' at ') + moment(date).format('HH:mm:ss'))

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

    console.log(helpers.date(date) + helpers.status(true) + helpers.search(file.search) + chalk.gray(helpers.from(result.from) + helpers.with(result.poster, result.trailer) + helpers.but(result.duplicate)) + helpers.percentage(index, total))

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

    console.error(helpers.date(date) + helpers.status(false) + helpers.search(file.search) + chalk.gray(helpers.dueTo(error)) + helpers.percentage(index, total))

    log.get('failures').push({
        date,
        error,
        file: _.pick(file, ['dir', 'base', 'search'])
    }).value()

    log.update('stats.failures', n => n + 1).value()
}

const title = (title) => {
    console.log(chalk.gray(`\n--- ${title} ---`))
}

const done = () => { // show stats and get process' duration
    console.log(helpers.stats('Success', log.get('stats.success').value(), 'green'))
    console.log(helpers.stats('Failures', log.get('stats.failures').value(), 'red'))
    console.log(helpers.stats('Movies', log.get('stats.movies').value(), 'cyan'))
    console.log(helpers.stats('Duplicates', log.get('stats.duplicates').value(), 'yellow'))

    log.set('duration', new Date() - log.get('date').value()).value()
}

const helpers = { // String helpers for printing in the console
    arrow: () => chalk.gray(' > '), // Print ' > '

    date: date => moment(date).format('YYYY-MM-DD HH:mm:ss') + helpers.arrow(), // Print '2016-11-29 22:34:10 > '

    status: success => success ? chalk.bgGreen('(+)') : chalk.bgRed('(-)'), // Print '(+)' or '(-)'

    search: search => chalk.gray(' {') + chalk.bold(search) + chalk.gray('}'), // Print ' {Her 2015}'

    from: from => ` from [${chalk.green(from)}]`, // Print ' from [api/allocine]'

    dueTo: message => ` due to [${chalk.red(message)}]`, // Print ' due to [extractor/saveThumbnail]'

    with: (poster, trailer) => { // Print ' with [poster, trailer]'
        const pt = []

        if (poster)
            pt.push(chalk.blue('poster'))

        if (trailer)
            pt.push(chalk.magenta('trailer'))

        return pt.length > 0 ? ` with [${pt.join(', ')}]` : ''
    },

    but: duplicate => duplicate ? ` but [${chalk.yellow('duplicate')}]` : '', // Print ' but [duplicate]'

    percentage: (index, total) => helpers.arrow() + chalk.inverse(percentage((index + 1) / total, config.percentage)), // Print ' > 99.3%'

    stats: (title, value, color) => chalk[color](title) + helpers.arrow() + value // Print 'Success > 4'
}


// *** Exports ***

module.exports = {
    init,
    success,
    failure,
    title,
    done
}
