// *** Imports ***

const fs = require('fs-extra')
const got = require('got')
const path = require('path')
const randomUa = require('random-ua')
const sharp = require('sharp')
const striptags = require('striptags')
const { chain, get, has, random, set } = require('lodash')

const api = require('./api')
const config = require('./config')
const utility = require('./utility')
const { LoggedError } = require('./error')



// *** Extractor ***

const allocine = {
    codes: async search => { // Extract AlloCiné codes from Google
        const results = await api.google(search + ' allocine', 'fr', 'fr') // Google

        const codes = []
        const rAllocine = [
            /http:\/\/www\.allocine\.fr\/film\/fichefilm_gen_cfilm=(\d+)\.html/i,
            /http:\/\/www\.allocine\.fr\/film\/fichefilm-(\d+)/i,
            /http:\/\/www\.allocine\.fr\/video\/player_gen_cmedia=\d+&cfilm=(\d+)\.html/i
        ]

        for (const url of results)
            for (const reg of rAllocine) { // Check every pattern until success
                const code = reg.exec(url) // Extract code from allocine url

                if (code) { // Pattern matched
                    codes.push(parseInt(code[1]))
                    break
                }
            }

        return codes
    },

    data: async code => { // Extract useful data only
        const result = await api.allocine.movie(code)

        if (result) {
            const data = { from: 'allocine', code }

            if (has(result, 'title'))
                set(data, 'title', get(result, 'title'))

            if (has(result, 'originalTitle') && get(result, 'originalTitle') !== get(data, 'title'))
                set(data, 'originalTitle', get(result, 'originalTitle'))

            if (has(result, 'nationality'))
                set(data, 'nationality', get(result, 'nationality').map(element => element.$))

            if (has(result, 'genre'))
                set(data, 'genre', get(result, 'genre').map(element => element.$))

            if (has(result, 'release.releaseDate'))
                set(data, 'releaseDate', get(result, 'release.releaseDate'))

            if (has(result, 'productionYear'))
                set(data, 'productionYear', get(result, 'productionYear').toString())

            if (has(result, 'runtime'))
                set(data, 'runtime', get(result, 'runtime'))

            if (has(result, 'synopsis'))
                set(data, 'synopsis', striptags(get(result, 'synopsis'), ['br']).replace(/<br ?\/?>/ig, '\n')) // Remove html tags except <br>

            if (has(result, 'castingShort.directors'))
                set(data, 'directors', get(result, 'castingShort.directors').split(', '))

            if (has(result, 'castingShort.actors'))
                set(data, 'actors', get(result, 'castingShort.actors').split(', '))

            if (has(result, 'poster.href'))
                set(data, 'poster.full', get(result, 'poster.href').replace('http://images.allocine.fr', `http://fr.web.img${random(1, 6)}.acsta.net`)) // Use a CDN which is more reliable

            if (has(result, 'trailer.code')) {
                const subResult = await api.allocine.trailer(get(result, 'trailer.code'))

                if (has(subResult, 'rendition')) {
                    const rendition = chain(subResult).get('rendition').orderBy('height', 'desc').value()

                    if (has(rendition, '[0].href'))
                        set(data, 'trailer', get(rendition, '[0].href'))
                }
            }

            if (has(result, 'statistics.pressRating'))
                set(data, 'rating.press', get(result, 'statistics.pressRating'))

            if (has(result, 'statistics.userRating'))
                set(data, 'rating.user', get(result, 'statistics.userRating'))

            return data
        }
    }
}

const poster = async movie => { // Download poster
    const url = movie.data.poster.full
    const dest = {
        full: path.format({ dir: config.locations.posters, name: movie.id, ext: path.extname(url) }),
        thumbnail: path.format({ dir: config.locations.thumbnails, name: movie.id, ext: path.extname(url) })
    }

    const gotStream = got.stream(url, {
        encoding: null,
        headers: { 'User-Agent': randomUa.generate() } // Download with a fake user-agent
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
    allocine,
    poster,
    trailer
}
