// *** Libraries ***

var extractor = require('./extractor.js')
var database = require('./database.js')
var config = require('./config.js')

var _ = require('lodash')
var sleep = require('thread-sleep')



// *** Core ***

var movieHandler = function (folder) {
    var movie

    // Find from INODE >>
    if (movie = database.findOneFromInode('movies', folder.inode) || database.findOneFromInode('buffer', folder.inode))
        return {from: 'inode', movie: _.omitBy({locations: [folder], data: movie.data}, _.isUndefined)} // If data is undefined then we remove it
    // <<

    // Find from SEARCH >>
    if (movie = database.findOneFromSearch('movies', folder.search) || database.findOneFromSearch('buffer', folder.search))
        return {from: 'search', movie: _.omitBy({locations: [folder], data: movie.data}, _.isUndefined)} // If data is undefined then we remove it
    // <<

    var codes = extractor.allocine.getCodes(folder.search)

    if (codes.length > 0) { // At least one code
        var code = codes[0]

        // Find from CODE >>
        if (movie = database.findOneFromCode('movies', code) || database.findOneFromCode('buffer', code))
            return {from: 'code', movie: {locations: [folder], data: movie.data}}
        // <<

        var data = extractor.allocine.getData(codes[0]) // Extract Allociné data from code

        // Find from API >>
        if (data)
            return {from: 'api/allocine', movie: {locations: [folder], data: data}}
        // <<
    }

    return {from: 'nothing', movie: {locations: [folder]}}
}

var duplicateHandler = function (result) {
    var duplicate

    if ('data' in result.movie) {
        if (duplicate = database.findOneFromCode('buffer', result.movie.data.code))
            result.duplicate = duplicate

        return result
    }

    if (duplicate = database.findOneFromSearch('buffer', result.movie.locations[0].search))
        result.duplicate = duplicate

    return result
}

var insertionHandler = function (result) {
    if (result.duplicate)
        database.update(result.duplicate, result.movie)
    else
        database.insert(result.movie)
}

var posterHandler = function (result) {
    result.poster = false

    if (/api/.test(result.from) && 'data' in result.movie && 'poster' in result.movie.data) {
        extractor.savePoster(result.movie.data.poster)
        result.poster = true
    }

    return result
}

var sleepHandler = function (result) {
    if (/code|api|nothing/.test(result.from))
        sleep(config.sleep)
}

var done = function () {
    database.flush()
}



// *** Exports ***

module.exports = {
    movieHandler: movieHandler,
    duplicateHandler: duplicateHandler,
    insertionHandler: insertionHandler,
    posterHandler: posterHandler,
    sleepHandler: sleepHandler,
    done: done
}
