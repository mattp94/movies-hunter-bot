// *** Libraries ***

const api = require('./api')
const utility = require('./utility')
const config = require('./config')
const error = require('./error')

const striptags = require('striptags')
const path = require('path')
const request = require('sync-request')
const fs = require('fs-plus')



// *** Extractor ***

const allocine = {
    getCodes: search => { // Extract AlloCiné codes from Google results
        const results = api.google(search + ' allocine', 'fr', 'fr', 5)

        const codes = []
        const rAllocine = /http:\/\/www\.allocine\.fr\/film\/fichefilm_gen_cfilm=(\d+)\.html/i

        for (const url of results) {
            const code = rAllocine.exec(url) // Extract code from allocine url

            if (code !== null)
                codes.push(parseInt(code[1]))
        }

        return codes
    },

    getData: code => { // Extract only useful data
        const result = api.allocine.movie(code)

        if (result) {
            const data = {
                from: 'allocine',
                code
            }

            if (result.title)
                data.title = result.title

            if (result.originalTitle && result.originalTitle !== data.title)
                data.originalTitle = result.originalTitle

            if (result.nationality)
                data.nationality = result.nationality.map(element => element.$)

            if (result.genre)
                data.genre = result.genre.map(element => element.$)

            if (result.release && result.release.releaseDate)
                data.releaseDate = result.release.releaseDate

            if (result.productionYear)
                data.productionYear = result.productionYear.toString()

            if (result.runtime)
                data.runtime = result.runtime

            if (result.synopsis)
                data.synopsis = striptags(result.synopsis, ['br']) // Remove html tags except <br>

            if (result.castingShort) {
                if (result.castingShort.directors)
                    data.directors = result.castingShort.directors.split(', ')

                if (result.castingShort.actors)
                    data.actors = result.castingShort.actors.split(', ')
            }

            if (result.poster && result.poster.href) {
                data.poster = {
                    full: result.poster.href.replace('http://images.allocine.fr', 'http://fr.web.img4.acsta.net') // Use a CDN which is more reliable
                }
            }

            if (result.trailer && result.trailer.href) {
                const href = api.allocine.trailer(code, result.trailer.code)

                if (href)
                    data.trailer = href
            }

            if (result.statistics) {
                data.rating = {}

                if (result.statistics.pressRating)
                    data.rating.press = result.statistics.pressRating

                if (result.statistics.userRating)
                    data.rating.user = result.statistics.userRating
            }

            return data
        }
    }
}

const savePoster = movie => { // Download poster
    const url = movie.data.poster.full
    const local = path.format({dir: config.locations.posters, name: movie.id, ext: path.extname(url)}) // Local path of poster

    let response

    try {
        response = request('GET', url) // Download
    } catch (e) {
        throw new error.LoggedError('extractor/savePoster')
    }

    fs.writeFileSync(utility.absolute(utility.tmp(local)), response.getBody()) // Save it in a temporary folder
    movie.data.poster.full = local // Update data with local path of poster
}

const saveThumbnail = movie => {
    let src = movie.data.poster.full
    const local = path.format({dir: config.locations.thumbnails, name: movie.id, ext: path.extname(src)}) // Local path of thumbnail

    if (config.download.posters)
        src = utility.absolute(utility.tmp(src)) // If src is a filename

    try {
        utility.thumbnailer(src, utility.absolute(utility.tmp(local)), config.thumbnail.width, config.thumbnail.height) // Save it in a temporary folder
    } catch (e) {
        throw new error.LoggedError('extractor/saveThumbnail')
    }

    movie.data.poster.thumbnail = local // Update data with local path of thumbnail
}

const saveTrailer = movie => { // Download trailer
    const url = movie.data.trailer
    const local = path.format({dir: config.locations.trailers, name: movie.id, ext: path.extname(url)}) // Local path of trailer

    let response

    try {
        response = request('GET', url) // Download
    } catch (e) {
        throw new error.LoggedError('extractor/saveTrailer')
    }

    fs.writeFileSync(utility.absolute(utility.tmp(local)), response.getBody()) // Save it in a temporary folder
    movie.data.trailer = local // Update data with local path of trailer
}



// *** Exports ***

module.exports = {
    allocine,
    savePoster,
    saveThumbnail,
    saveTrailer
}
