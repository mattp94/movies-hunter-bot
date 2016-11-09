// *** Libraries ***

var extractor = require('./extractor.js')
var database = require('./database.js')
var config = require('./config.js')

var _ = require('lodash')
var sleep = require('thread-sleep')



// *** Core ***

var movieHandler = function (file) {
    var movie

    // Find from INODE >>
    if (movie = database.findOneFromInode('movies', file.inode) || database.findOneFromInode('buffer', file.inode))
        return {from: 'inode', movie: _.omitBy({files: [file], data: movie.data}, _.isUndefined)} // If data is undefined then we remove it
    // <<

    // Find from SEARCH >>
    if (movie = database.findOneFromSearch('movies', file.search) || database.findOneFromSearch('buffer', file.search))
        return {from: 'search', movie: _.omitBy({files: [file], data: movie.data}, _.isUndefined)} // If data is undefined then we remove it
    // <<

    var codes = extractor.allocine.getCodes(file.search)

    if (codes.length > 0) { // At least one code
        var code = codes[0]

        // Find from CODE >>
        if (movie = database.findOneFromCode('movies', code) || database.findOneFromCode('buffer', code))
            return {from: 'code', movie: {files: [file], data: movie.data}}
        // <<

        var data = extractor.allocine.getData(codes[0]) // Extract Allociné data from code

        // Find from API >>
        if (data)
            return {from: 'api/allocine', movie: {files: [file], data: data}}
        // <<
    }

    return {from: 'nothing', movie: {files: [file]}}
}

var duplicateHandler = function (result) {
    var duplicate

    if (result.movie.data) {
        if (duplicate = database.findOneFromCode('buffer', result.movie.data.code))
            result.duplicate = duplicate

        return result
    }

    if (duplicate = database.findOneFromSearch('buffer', result.movie.files[0].search))
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

    if (/api/.test(result.from) && result.movie.data && result.movie.data.poster) {
        extractor.savePoster(result.movie.data)
        result.poster = true
    }

    return result
}

var trailerHandler = function (result) {
    result.trailer = false

    if (/api/.test(result.from) && result.movie.data && result.movie.data.trailer) {
        if (config.download.trailers)
            extractor.saveTrailer(result.movie.data)

        result.trailer = true
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
    trailerHandler: trailerHandler,
    sleepHandler: sleepHandler,
    done: done
}
