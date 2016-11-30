// *** Libraries ***

var utility = require('./utility')
var config = require('./config')
var database = require('./database')

var lowdb = require('lowdb')
var chalk = require('chalk')
var moment = require('moment')
var _ = require('lodash')
var percentage = require('percentage')
var path = require('path')



// *** Logger ***

var log = lowdb(utility.absolute(config.locations.log)) // Load log from json file

var init = function () {
    var date = new Date()

    console.log(chalk.gray('Movies-Hunter Bot v0.0.0 by mattp94\nLaunched on ') + moment(date).format('dddd, MMMM Do YYYY') + chalk.gray(' at ') + moment(date).format('HH:mm:ss') + chalk.gray('\n\n--- Scraping ---'))

    log.setState({
        date: date,
        duration: null,
        stats: {
            success: 0,
            failures: 0,
            movies: 0,
            duplicates: 0
        },
        duplicates: {},
        failures: [],
        success: []
    })
}

var success = function (result, file, index, total) {
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

var failure = function (error, file, index, total) {
    var date = new Date()

    console.error(helper.date(date) + helper.status(false) + helper.search(file.search) + helper.dueTo(error) + helper.percentage(index, total))

    log.get('failures').push({
        date: date,
        error: error,
        file: _.pick(file, ['dir', 'base', 'search'])
    }).value()

    log.update('stats.failures', function (n) { return n + 1 }).value()
}

var done = function () {
    console.log(chalk.gray('\n--- Stats ---') + helper.stat('Success', log.get('stats.success').value(), 'green') + helper.stat('Failures', log.get('stats.failures').value(), 'red') + helper.stat('Movies', log.get('stats.movies').value(), 'blue') + helper.stat('Duplicates', log.get('stats.duplicates').value(), 'yellow'))

    log.set('duration', new Date() - log.get('date').value()).value()
    log.set('duplicates', _.chain(database.findDuplicates()).keyBy(movie => movie.id).mapValues(movie => movie.files.map(file => path.format(file))).value()).value()
}

var helper = {
    arrow: function () { // e.g. ' > '
        return chalk.gray(' > ')
    },

    date: function (date) { // e.g. '2016-11-29 22:34:10'
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },

    status: function (success) { // e.g. ' > (+)'
        if (success)
            var sign = chalk.bgGreen('(+)')
        else
            var sign = chalk.bgRed('(-)')

        return helper.arrow() + sign
    },

    search: function (search) { // e.g. '{Her 2015}'
        return chalk.gray(' {') + chalk.bold(search) + chalk.gray('}')
    },

    from: function (from) { // e.g. ' from [api/allocine]'
        return chalk.gray(' from [') + chalk.green(from) + chalk.gray(']')
    },

    dueTo: function (message) { // e.g. ' due to [extractor/saveThumbnail]'
        return chalk.gray(' due to [') + chalk.red(message) + chalk.gray(']')
    },

    with: function (poster, trailer) { // e.g. ' with [poster, trailer]'
        var pt = []

        if (poster)
            pt.push(chalk.blue('poster'))

        if (trailer)
            pt.push(chalk.magenta('trailer'))

        return pt.length > 0 ? chalk.gray(' with [' + pt.join(', ') + ']') : ''
    },

    but: function (duplicate) { // e.g. ' but [duplicate]'
        return duplicate ? chalk.gray(' but [' + chalk.yellow('duplicate') + ']') : ''
    },

    percentage: function (index, total) { // e.g. ' > 99.3%'
        return helper.arrow() + chalk.inverse(percentage((index + 1) / total, config.percentage))
    },

    stat: function (title, value, color) { // e.g. 'Success > 4'
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
