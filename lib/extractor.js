// *** Libraries ***

const api = require('./api')
const utility = require('./utility')
const config = require('./config')
const {LoggedError} = require('./error')

const striptags = require('striptags')
const path = require('path')
const got = require('got')
const fs = require('fs')
const _ = require('lodash')
const randomUa = require('random-ua')



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

            if (_.has(result, 'title'))
                _.set(data, 'title', _.get(result, 'title'))

            if (_.has(result, 'originalTitle') && _.get(result, 'originalTitle') !== _.get(data, 'title'))
                _.set(data, 'originalTitle', _.get(result, 'originalTitle'))

            if (_.has(result, 'nationality'))
                _.set(data, 'nationality', _.get(result, 'nationality').map(element => element.$))

            if (_.has(result, 'genre'))
                _.set(data, 'genre', _.get(result, 'genre').map(element => element.$))

            if (_.has(result, 'release.releaseDate'))
                _.set(data, 'releaseDate', _.get(result, 'release.releaseDate'))

            if (_.has(result, 'productionYear'))
                _.set(data, 'productionYear', _.get(result, 'productionYear').toString())

            if (_.has(result, 'runtime'))
                _.set(data, 'runtime', _.get(result, 'runtime'))

            if (_.has(result, 'synopsis'))
                _.set(data, 'synopsis', striptags(_.get(result, 'synopsis'), ['br']).replace(/<br ?\/?>/ig, '\n')) // Remove html tags except <br>

            if (_.has(result, 'castingShort.directors'))
                _.set(data, 'directors', _.get(result, 'castingShort.directors').split(', '))

            if (_.has(result, 'castingShort.actors'))
                _.set(data, 'actors', _.get(result, 'castingShort.actors').split(', '))

            if (_.has(result, 'poster.href'))
                _.set(data, 'poster.full', _.get(result, 'poster.href').replace('http://images.allocine.fr', `http://fr.web.img${_.random(1, 6)}.acsta.net`)) // Use a CDN which is more reliable

            if (_.has(result, 'trailer.code')) {
                const subResult = await api.allocine.trailer(_.get(result, 'trailer.code'))

                if (_.has(subResult, 'rendition')) {
                    const rendition = _.chain(subResult).get('rendition').orderBy('height', 'desc').value()

                    if (_.has(rendition, '[0].href'))
                        _.set(data, 'trailer', _.get(rendition, '[0].href'))
                }
            }

            if (_.has(result, 'statistics.pressRating'))
                _.set(data, 'rating.press', _.get(result, 'statistics.pressRating'))

            if (_.has(result, 'statistics.userRating'))
                _.set(data, 'rating.user', _.get(result, 'statistics.userRating'))

            return data
        }
    }
}

const poster = async movie => { // Download poster
    const url = movie.data.poster.full
    const local = path.format({ dir: config.locations.posters, name: movie.id, ext: path.extname(url) }) // Local path of poster

    let response

    try {
        response = await got(url, {
            encoding: null,
            headers: { 'User-Agent': randomUa.generate() } // Download with a fake user-agent
        })
    } catch (e) {
        throw new LoggedError('extractor/poster', e.statusCode || e.code)
    }

    fs.writeFileSync(utility.absolute(utility.tmp(local)), response.body) // Save it in a temporary folder
    movie.data.poster.full = local // Update data with local path of poster
}

const thumbnail = movie => { // Generate a thumbnail
    let src = movie.data.poster.full
    const local = path.format({ dir: config.locations.thumbnails, name: movie.id, ext: path.extname(src) }) // Local path of thumbnail

    if (config.download.posters)
        src = utility.absolute(utility.tmp(src)) // If src is a pathname

    try {
        utility.thumbnailer(src, utility.absolute(utility.tmp(local)), config.thumbnail.width, config.thumbnail.height) // Save it in a temporary folder
    } catch (e) {
        throw new LoggedError('extractor/thumbnail')
    }

    movie.data.poster.thumbnail = local // Update data with local path of thumbnail
}

const trailer = async movie => { // Download trailer
    const url = movie.data.trailer
    const local = path.format({ dir: config.locations.trailers, name: movie.id, ext: path.extname(url) }) // Local path of trailer

    let response

    try {
        response = await got(url, {
            encoding: null,
            headers: { 'User-Agent': randomUa.generate() } // Download with a fake user-agent
        })
    } catch (e) {
        throw new LoggedError('extractor/trailer', e.statusCode || e.code)
    }

    fs.writeFileSync(utility.absolute(utility.tmp(local)), response.body) // Save it in a temporary folder
    movie.data.trailer = local // Update data with local path of trailer
}



// *** Exports ***

module.exports = {
    allocine,
    poster,
    thumbnail,
    trailer
}
