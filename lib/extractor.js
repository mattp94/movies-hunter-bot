// *** Libraries ***

var api = require('./api')
var utility = require('./utility')
var config = require('./config')
var error = require('./error')

var striptags = require('striptags')
var path = require('path')
var request = require('sync-request')
var fs = require('fs')



// *** Extractor ***

var allocine = {
    getCodes: function (search) { // Extract AlloCiné codes from Google results
        var results = api.google(search + ' allocine', 'fr', 'fr', 5)

        var codes = []
        var rAllocine = /http:\/\/www\.allocine\.fr\/film\/fichefilm_gen_cfilm=(\d+)\.html/i

        results.forEach(function (url) {
            var code = rAllocine.exec(url)

            if (code !== null)
                codes.push(parseInt(code[1]))
        })

        return codes
    },

    getData: function (code) { // Extract only useful data
        var result = api.allocine.movie(code)

        if (result) {
            var data = {code: code}

            if (result.title)
                data.title = result.title

            if (result.originalTitle && result.originalTitle !== data.title)
                data.originalTitle = result.originalTitle

            if (result.nationality) {
                data.nationality = []

                result.nationality.forEach(function (element) {
                    if (element.$)
                        data.nationality.push(element.$)
                })
            }

            if (result.genre) {
                data.genre = []

                result.genre.forEach(function (element) {
                    if (element.$)
                        data.genre.push(element.$)
                })
            }

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
                var href = api.allocine.trailer(code, result.trailer.code)

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

var savePoster = function (movie) { // Save poster & generate a thumbnail
    var full = path.format({dir: config.locations.posters, name: movie.id, ext: path.extname(movie.data.poster.full)}) // Local path of poster
    var thumbnail = path.format({dir: config.locations.thumbnails, name: movie.id, ext: path.extname(full)}) // Local path of thumbnail

    try {
        var response = request('GET', movie.data.poster.full) // Download
    } catch (e) {
        throw new error.BotError('extractor/savePoster')
    }

    fs.writeFileSync(utility.getAbsolutePath(full), response.getBody()) // Save

    utility.thumbnailer(utility.getAbsolutePath(full), utility.getAbsolutePath(thumbnail), config.thumbnail.width, config.thumbnail.height) // Generate a thumbnail
    movie.data.poster.thumbnail = thumbnail // Update data with local path of thumbnail

    if (config.download.posters)
        movie.data.poster.full = full // Update data with local path of poster
    else
        fs.unlinkSync(utility.getAbsolutePath(full)) // Remove poster
}

var saveTrailer = function (movie) { // Download trailer
    var trailer = path.format({dir: config.locations.trailers, name: movie.id, ext: path.extname(movie.data.trailer)}) // Local path of trailer

    try {
        var response = request('GET', movie.data.trailer) // Download
    } catch (e) {
        throw new error.BotError('extractor/saveTrailer')
    }

    fs.writeFileSync(utility.getAbsolutePath(trailer), response.getBody()) // Save

    movie.data.trailer = trailer // Update data with local path of trailer
}



// *** Exports ***

module.exports = {
    allocine: allocine,
    savePoster: savePoster,
    saveTrailer: saveTrailer
}
