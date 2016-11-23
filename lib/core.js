// *** Libraries ***

var extractor = require('./extractor')
var database = require('./database')
var config = require('./config')
var utility = require('./utility')

var _ = require('lodash')
var sleep = require('thread-sleep')
var uuid = require('uuid')
var fs = require('fs-plus')



// *** Core ***

var movieHandler = function (file) {
    var movie

    // Find from INODE >>
    if (movie = database.findOneFromInode('movies', file.inode) || database.findOneFromInode('tmp', file.inode))
        return {from: 'inode', movie: _.omitBy({id: movie.id, files: [file], data: movie.data}, _.isUndefined)} // If data is undefined then we remove it
    // <<

    // Find from SEARCH >>
    if (movie = database.findOneFromSearch('movies', file.search) || database.findOneFromSearch('tmp', file.search))
        return {from: 'search', movie: _.omitBy({id: movie.id, files: [file], data: movie.data}, _.isUndefined)} // If data is undefined then we remove it
    // <<

    var codes = extractor.allocine.getCodes(file.search)

    if (codes.length > 0) { // At least one code
        var code = codes[0]

        // Find from CODE >>
        if (movie = database.findOneFromCode('movies', code, 'allocine') || database.findOneFromCode('tmp', code, 'allocine'))
            return {from: 'code', movie: {id: movie.id, files: [file], data: movie.data}}
        // <<

        var data = extractor.allocine.getData(codes[0]) // Extract Allociné data from code

        // Find from API >>
        if (data)
            return {from: 'api/allocine', movie: {id: uuid(), files: [file], data: data}}
        // <<
    }

    return {from: 'nothing', movie: {id: uuid(), files: [file]}}
}

var duplicateHandler = function (result) {
    var duplicate

    if (result.movie.data) {
        if (duplicate = database.findOneFromCode('tmp', result.movie.data.code))
            result.duplicate = duplicate

        return result
    }

    if (duplicate = database.findOneFromSearch('tmp', result.movie.files[0].search))
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

    if (result.movie.data && result.movie.data.poster) {
        result.poster = true

        if (/api/.test(result.from)) {
            if (config.download.posters)
                extractor.savePoster(result.movie)

            extractor.saveThumbnail(result.movie)
        } else {
            if (config.download.posters)
                fs.moveSync(utility.absolute(result.movie.data.poster.full), utility.absolute(utility.tmp(result.movie.data.poster.full)))

            fs.moveSync(utility.absolute(result.movie.data.poster.thumbnail), utility.absolute(utility.tmp(result.movie.data.poster.thumbnail)))
        }
    }

    return result
}

var trailerHandler = function (result) {
    result.trailer = false

    if (result.movie.data && result.movie.data.trailer) {
        result.trailer = true

        if (config.download.trailers)
            if (/api/.test(result.from))
                extractor.saveTrailer(result.movie)
            else
                fs.moveSync(utility.absolute(result.movie.data.trailer), utility.absolute(utility.tmp(result.movie.data.trailer)))
    }

    return result
}

var sleepHandler = function (result) {
    if (/code|api|nothing/.test(result.from))
        sleep(config.sleep)
}

var flush = function (pathname) {
    fs.removeSync(utility.absolute(pathname))
    fs.renameSync(utility.tmp(utility.absolute(pathname), true), utility.absolute(pathname))
}

var done = function () {
    flush(config.locations.thumbnails) // thumbnails tmp to thumbnails

    if (config.download.posters)
        flush(config.locations.posters) // posters tmp to posters

    if (config.download.trailers)
        flush(config.locations.trailers) // trailers tmp to trailers

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
