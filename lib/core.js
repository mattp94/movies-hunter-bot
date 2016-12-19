// *** Libraries ***

const extractor = require('./extractor')
const database = require('./database')
const config = require('./config')
const utility = require('./utility')

const _ = require('lodash')
const sleep = require('thread-sleep')
const uuid = require('uuid')
const fs = require('fs')
const rimraf = require('rimraf')



// *** Core ***

const movieHandler = file => { // Get data for movie and return from + movie
    let movie

    // Find from INODE >>
    if (movie = database.findOneFromInode('movies', file.inode) || database.findOneFromInode('tmp', file.inode))
        return {from: 'inode', movie: _.omitBy({id: movie.id, files: [file], data: movie.data}, _.isUndefined)} // If data is undefined then we remove it
    // <<

    // Find from SEARCH >>
    if (movie = database.findOneFromSearch('movies', file.search) || database.findOneFromSearch('tmp', file.search))
        return {from: 'search', movie: _.omitBy({id: movie.id, files: [file], data: movie.data}, _.isUndefined)} // If data is undefined then we remove it
    // <<

    const codes = extractor.allocine.getCodes(file.search)

    if (codes.length > 0) { // At least one code
        const code = codes[0]

        // Find from CODE >>
        if (movie = database.findOneFromCode('movies', code, 'allocine') || database.findOneFromCode('tmp', code, 'allocine'))
            return {from: 'code', movie: {id: movie.id, files: [file], data: movie.data}}
        // <<

        const data = extractor.allocine.getData(codes[0]) // Extract AlloCiné data from code

        // Find from API >>
        if (data)
            return {from: 'api/allocine', movie: {id: uuid(), files: [file], data}}
        // <<
    }

    return {from: 'nothing', movie: {id: uuid(), files: [file]}}
}

const duplicateHandler = result => { // Check if a movie is a duplicate
    let duplicate

    if (result.movie.data) {
        if (duplicate = database.findOneFromCode('tmp', result.movie.data.code, result.movie.data.from))
            result.duplicate = duplicate

        return result
    }

    if (duplicate = database.findOneFromSearch('tmp', result.movie.files[0].search))
        result.duplicate = duplicate

    return result
}

const insertionHandler = result => { // Insert a movie in db (normal or duplicate)
    if (result.duplicate)
        database.update(result.duplicate, result.movie)
    else
        database.insert(result.movie)
}

const posterHandler = result => { // Handle poster and thumbnail (download or move it)
    result.poster = false

    if (result.movie.data && result.movie.data.poster) {
        result.poster = true

        if (/api/.test(result.from)) {
            if (config.download.posters)
                extractor.savePoster(result.movie)

            extractor.saveThumbnail(result.movie)
        } else if (!result.duplicate) {
            if (config.download.posters)
                fs.renameSync(utility.absolute(result.movie.data.poster.full), utility.absolute(utility.tmp(result.movie.data.poster.full)))

            fs.renameSync(utility.absolute(result.movie.data.poster.thumbnail), utility.absolute(utility.tmp(result.movie.data.poster.thumbnail)))
        }
    }

    return result
}

const trailerHandler = result => { // Handle trailer (download or move it)
    result.trailer = false

    if (result.movie.data && result.movie.data.trailer) {
        result.trailer = true

        if (config.download.trailers)
            if (/api/.test(result.from))
                extractor.saveTrailer(result.movie)
            else if (!result.duplicate)
                fs.renameSync(utility.absolute(result.movie.data.trailer), utility.absolute(utility.tmp(result.movie.data.trailer)))
    }

    return result
}

const sleepHandler = result => { // Do a break if necessary
    if (/code|api|nothing/.test(result.from))
        sleep(_.random(config.sleep.min, config.sleep.max)) // Random delay to cheat api & search engines
}

const init = () => { // Create tmp directories for thumbnails, posters and trailers if necessary
    fs.mkdirSync(utility.tmp(config.locations.thumbnails, true)) // Create tmp directory for thumbnails

    if (config.download.posters)
        fs.mkdirSync(utility.tmp(config.locations.posters, true)) // Create tmp directory for posters

    if (config.download.trailers)
        fs.mkdirSync(utility.tmp(config.locations.trailers, true)) // Create tmp directory for trailers
}

const done = () => { // Flush handler
    flush(config.locations.thumbnails) // thumbnails tmp to thumbnails

    if (config.download.posters)
        flush(config.locations.posters) // posters tmp to posters

    if (config.download.trailers)
        flush(config.locations.trailers) // trailers tmp to trailers

    database.flush()
}

const flush = pathname => { // Replace old data with new (tmp)
    const absPath = utility.absolute(pathname)
    const tmpPath = utility.tmp(absPath, true)

    rimraf.sync(absPath)
    fs.renameSync(tmpPath, absPath)
}



// *** Exports ***

module.exports = {
    movieHandler,
    duplicateHandler,
    insertionHandler,
    posterHandler,
    trailerHandler,
    sleepHandler,
    init,
    done
}
