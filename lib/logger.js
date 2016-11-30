// *** Libraries ***

var utility = require('./utility')
var config = require('./config')

var fs = require('fs-plus')
var path = require('path')
var lowdb = require('lowdb')
var chalk = require('chalk')
var moment = require('moment')
var _ = require('lodash')
var percentage = require('percentage')



// *** Logger ***

fs.makeTreeSync(path.dirname(utility.absolute(config.locations.log))) // Create directory if not exists

var log = lowdb(utility.absolute(config.locations.log)) // Load log from json file

var init = function () { // Initialize log (reset log, starting date)
    var date = new Date()
    var version = require(utility.absolute('./package.json')).version

    console.log(chalk.gray('Movies-Hunter Bot v' + version + ' by mattp94\nLaunched on ') + moment(date).format('dddd, MMMM Do YYYY') + chalk.gray(' at ') + moment(date).format('HH:mm:ss') + chalk.gray('\n\n--- Scraping ---'))

    log.setState({ // Reset log
        date: date,
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

var success = function (result, file, index, total) { // Log a successful movie
    var date = new Date()

    console.log(helper.date(date) + helper.status(true) + helper.search(file.search) + helper.from(result.from) + helper.with(result.poster, result.trailer) + helper.but(result.duplicate) + helper.percentage(index, total))

    log.get('success').push({
        date: date,
        from: result.from,
        duplicate: result.duplicate ? true : false,
        poster: result.poster,
        trailer: result.trailer,
        file: _.pick(file, ['dir', 'base', 'search'])
    }).value()

    log.update('stats.success', function (n) { return n + 1 }).value()

    if (result.duplicate)
        log.update('stats.duplicates', function (n) { return n + 1 }).value()
    else
        log.update('stats.movies', function (n) { return n + 1 }).value()
}

var failure = function (error, file, index, total) { // Log a failed movie
    var date = new Date()

    console.error(helper.date(date) + helper.status(false) + helper.search(file.search) + helper.dueTo(error) + helper.percentage(index, total))

    log.get('failures').push({
        date: date,
        error: error,
        file: _.pick(file, ['dir', 'base', 'search'])
    }).value()

    log.update('stats.failures', function (n) { return n + 1 }).value()
}

var done = function () { // Display stats and get process' duration
    console.log(chalk.gray('\n--- Stats ---') + helper.stat('Success', log.get('stats.success').value(), 'green') + helper.stat('Failures', log.get('stats.failures').value(), 'red') + helper.stat('Movies', log.get('stats.movies').value(), 'blue') + helper.stat('Duplicates', log.get('stats.duplicates').value(), 'yellow'))

    log.set('duration', new Date() - log.get('date').value()).value()
}

var helper = { // String helper for printing in the console
    arrow: function () { // Print ' > '
        return chalk.gray(' > ')
    },

    date: function (date) { // Print '2016-11-29 22:34:10'
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },

    status: function (success) { // Print ' > (+)'
        if (success)
            var sign = chalk.bgGreen('(+)')
        else
            var sign = chalk.bgRed('(-)')

        return helper.arrow() + sign
    },

    search: function (search) { // Print '{Her 2015}'
        return chalk.gray(' {') + chalk.bold(search) + chalk.gray('}')
    },

    from: function (from) { // Print ' from [api/allocine]'
        return chalk.gray(' from [') + chalk.green(from) + chalk.gray(']')
    },

    dueTo: function (message) { // Print ' due to [extractor/saveThumbnail]'
        return chalk.gray(' due to [') + chalk.red(message) + chalk.gray(']')
    },

    with: function (poster, trailer) { // Print ' with [poster, trailer]'
        var pt = []

        if (poster)
            pt.push(chalk.blue('poster'))

        if (trailer)
            pt.push(chalk.magenta('trailer'))

        return pt.length > 0 ? chalk.gray(' with [' + pt.join(', ') + ']') : ''
    },

    but: function (duplicate) { // Print ' but [duplicate]'
        return duplicate ? chalk.gray(' but [' + chalk.yellow('duplicate') + ']') : ''
    },

    percentage: function (index, total) { // Print ' > 99.3%'
        return helper.arrow() + chalk.inverse(percentage((index + 1) / total, config.percentage))
    },

    stat: function (title, value, color) { // Print 'Success > 4'
        return '\n' + chalk[color](title) + helper.arrow() + value
    }
}


// *** Exports ***

module.exports = {
    init: init,
    success: success,
    failure: failure,
    done: done
}
