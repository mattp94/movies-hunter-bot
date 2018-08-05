// *** Imports ***

const fs = require('fs-extra')
const sleep = require('es7-sleep')
const uuid = require('uuid')

const config = require('./config')
const database = require('./database')
const extractor = require('./extractor')
const utility = require('./utility')



// *** Core ***

const buckets = [config.locations.posters, config.locations.thumbnails, config.locations.trailers]

const init = async () => {
    await Promise.all([
        ...buckets.map(pathname => fs.ensureDir(utility.tmp(utility.abs(pathname), true))), // Create tmp folders if not exist
        database.init()
    ])
}

const movie = async file => { // Get data for movie and return from + movie
    const hasTag = {
        local: utility.hasTag(file.tags, 'local'),
        reset: utility.hasTag(file.tags, 'reset')
    }

    if (!hasTag.local) {
        let movie

        // < Find from INODE >
        if (!hasTag.reset && (movie = database.findOneFromInode('movies', file.inode) || database.findOneFromInode('tmp', file.inode)))
            return { from: 'inode', movie: { id: movie.id, files: [file], data: movie.data } }

        // < Find from SEARCH >
        if (!hasTag.reset && (movie = database.findOneFromSearch('movies', file.search) || database.findOneFromSearch('tmp', file.search)))
            return { from: 'search', movie: { id: movie.id, files: [file], data: movie.data } }

        const codes = await extractor.allocine.codes(file.search)

        if (codes.length > 0) { // At least one code
            const code = codes[0]

            // < Find from CODE >
            if (!hasTag.reset && (movie = database.findOneFromCode('movies', code, 'allocine') || database.findOneFromCode('tmp', code, 'allocine')))
                return { from: 'code', movie: { id: movie.id, files: [file], data: movie.data } }

            const data = await extractor.allocine.data(codes[0]) // Extract AlloCiné data from code

            // < Find from API >
            if (data)
                return { from: 'api/allocine', movie: { id: uuid(), files: [file], data } }
        }
    }

    return { from: 'nothing', movie: { id: uuid(), files: [file] } }
}

const duplicate = result => { // Check if a movie is a duplicate
    let duplicate

    if (result.movie.data)
        if (duplicate = database.findOneFromCode('tmp', result.movie.data.code, result.movie.data.from))
            result.duplicate = duplicate
    else if (duplicate = database.findOneFromSearch('tmp', result.movie.files[0].search))
        result.duplicate = duplicate
}

const insertion = async result => { // Insert a movie in db (normal or duplicate)
    if (result.duplicate)
        await database.update(result.duplicate, result.movie)
    else
        await database.insert(result.movie)
}

const poster = async result => { // Handle poster and thumbnail (download or move it)
    result.poster = false

    if (result.movie.data && result.movie.data.poster) {
        result.poster = true

        if (/api/.test(result.from))
            await extractor.poster(result.movie)
        else if (!result.duplicate)
            await Promise.all([
                fs.rename(utility.abs(result.movie.data.poster.full), utility.abs(utility.tmp(result.movie.data.poster.full))),
                fs.rename(utility.abs(result.movie.data.poster.thumbnail), utility.abs(utility.tmp(result.movie.data.poster.thumbnail)))
            ])
    }
}

const trailer = async result => { // Handle trailer (download or move it)
    result.trailer = false

    if (result.movie.data && result.movie.data.trailer) {
        result.trailer = true

        if (/api/.test(result.from))
            await extractor.trailer(result.movie)
        else if (!result.duplicate)
            await fs.rename(utility.abs(result.movie.data.trailer), utility.abs(utility.tmp(result.movie.data.trailer)))
    }
}

const delay = async result => { // Do a break if necessary
    if (/code|api|nothing/.test(result.from))
        await sleep(config.delay * 1000)
}

const flush = async () => { // Flush handler
    await Promise.all([
        ...buckets.map(async pathname => { // Flush tmp folders in final folders
            const abs = utility.abs(pathname)
            const tmp = utility.tmp(abs, true)

            await fs.remove(abs)
            await fs.rename(tmp, abs)
        }),
        database.flush() // Flush tmp to movies
    ])
}



// *** Exports ***

module.exports = {
    init,
    movie,
    duplicate,
    insertion,
    poster,
    trailer,
    delay,
    flush
}
