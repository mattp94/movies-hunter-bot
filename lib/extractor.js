// *** Imports ***

const fs = require('fs-extra')
const got = require('got')
const moment = require('moment')
const path = require('path')
const sharp = require('sharp')
const striptags = require('striptags')
const { get, has, set } = require('lodash')

const api = require('./api')
const config = require('./config')
const utility = require('./utility')
const { LoggedError } = require('./error')



// *** Extractor ***

const tmdb = {
    codes: async search => { // Extract TMDb codes from Google
        const results = await api.google(search + ' imdb', 'fr', 'fr') // Google

        const codes = []

        for (const url of results) {
            const code = /(tt\d+)/.exec(url) // Extract code from url

            if (code) { // Pattern matched
                codes.push(code[1])
            }
        }

        return codes
    },

    data: async code => { // Extract useful data only
        const data = { from: 'tmdb', code }
        
        const details = await api.tmdb.details(code)

        if (has(details, 'title'))
            set(data, 'title', get(details, 'title'))

        if (has(details, 'original_title') && get(details, 'original_title') !== get(data, 'title'))
            set(data, 'originalTitle', get(details, 'original_title'))

        if (has(details, 'production_countries'))
            set(data, 'nationality', get(details, 'production_countries').map(element => element.name))

        if (has(details, 'genres'))
            set(data, 'genre', get(details, 'genres').map(element => element.name))

        if (has(details, 'release_date')) {
            set(data, 'releaseDate', get(details, 'release_date'))
            set(data, 'productionYear', moment(get(data, 'releaseDate')).year().toString())
        }

        if (has(details, 'runtime'))
            set(data, 'runtime', get(details, 'runtime') * 60)

        if (has(details, 'overview'))
            set(data, 'synopsis', striptags(get(details, 'overview'), ['br']).replace(/<br ?\/?>/ig, '\n')) // Remove html tags except <br>

        if (has(details, 'poster_path'))
            set(data, 'poster.full', 'https://image.tmdb.org/t/p/original/' + get(details, 'poster_path'))

        if (has(details, 'vote_average'))
            set(data, 'rating.user', get(details, 'vote_average') / 2)

        const credits = await api.tmdb.credits(code)

        if (has(credits, 'crew'))
            set(data, 'directors', get(credits, 'crew').filter(element => element.job === 'Director').map(element => element.name))

        if (has(credits, 'cast'))
            set(data, 'actors', get(credits, 'cast').map(element => element.name).slice(0, 5))

        return data
    }
}

const poster = async movie => { // Download poster
    const url = movie.data.poster.full
    const dest = {
        full: path.format({ dir: config.locations.posters, name: movie.id, ext: path.extname(url) }),
        thumbnail: path.format({ dir: config.locations.thumbnails, name: movie.id, ext: path.extname(url) })
    }

    const gotStream = got.stream(url, {
        encoding: null
    })

    try {
        await Promise.all([
            utility.pipe(
                gotStream,
                fs.createWriteStream(utility.abs(utility.tmp(dest.full))) // Save it in a temporary folder
            ),
            utility.pipe(
                gotStream,
                sharp().resize(config.thumbnail.width, config.thumbnail.height), // Resize picture
                fs.createWriteStream(utility.abs(utility.tmp(dest.thumbnail))) // Save it in a temporary folder
            )
        ])
    } catch (err) {
        throw err.name === 'HTTPError' ? new LoggedError('extractor/poster', err.statusCode) : err
    } 

    movie.data.poster.full = dest.full
    movie.data.poster.thumbnail = dest.thumbnail
}

const trailer = async movie => { // Download trailer
    const url = movie.data.trailer
    const dest = path.format({ dir: config.locations.trailers, name: movie.id, ext: path.extname(url) })

    try {
        await utility.pipe(
            got.stream(url, {
                encoding: null,
                headers: { 'User-Agent': randomUa.generate() } // Download with a fake user-agent
            }),
            fs.createWriteStream(utility.abs(utility.tmp(dest))) // Save it in a temporary folder
        )
    } catch (err) {
        throw err.name === 'HTTPError' ? new LoggedError('extractor/trailer', err.statusCode) : err
    }

    movie.data.trailer = dest
}



// *** Exports ***

module.exports = {
    tmdb,
    poster,
    trailer
}
