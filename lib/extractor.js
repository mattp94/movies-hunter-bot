// *** Libraries ***

var api = require('./api')
var utility = require('./utility')
var config = require('./config')
var error = require('./error')

var striptags = require('striptags')
var path = require('path')
var request = require('sync-request')
var fs = require('fs-plus')



// *** Extractor ***

var allocine = {
    getCodes: function (search) { // Extract AlloCiné codes from Google results
        var results = api.google(search + ' allocine', 'fr', 'fr', 5)

        var codes = []
        var rAllocine = /http:\/\/www\.allocine\.fr\/film\/fichefilm_gen_cfilm=(\d+)\.html/i

        results.forEach(function (url) {
            var code = rAllocine.exec(url) // Extract code from allocine url

            if (code !== null)
                codes.push(parseInt(code[1]))
        })

        return codes
    },

    getData: function (code) { // Extract only useful data
        var result = api.allocine.movie(code)

        if (result) {
            var data = {
                from: 'allocine',
                code: code
            }

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

var savePoster = function (movie) { // Download poster
    var url = movie.data.poster.full
    var local = path.format({dir: config.locations.posters, name: movie.id, ext: path.extname(url)}) // Local path of poster

    try {
        var response = request('GET', url) // Download
    } catch (e) {
        throw new error.LoggedError('extractor/savePoster')
    }

    fs.writeFileSync(utility.absolute(utility.tmp(local)), response.getBody()) // Save it in a temporary folder
    movie.data.poster.full = local // Update data with local path of poster
}

var saveThumbnail = function (movie) {
    var src = movie.data.poster.full
    var local = path.format({dir: config.locations.thumbnails, name: movie.id, ext: path.extname(src)}) // Local path of thumbnail

    if (config.download.posters)
        src = utility.absolute(utility.tmp(src)) // If src is a filename

    try {
        utility.thumbnailer(src, utility.absolute(utility.tmp(local)), config.thumbnail.width, config.thumbnail.height) // Save it in a temporary folder
    } catch (e) {
        throw new error.LoggedError('extractor/saveThumbnail')
    }

    movie.data.poster.thumbnail = local // Update data with local path of thumbnail
}

var saveTrailer = function (movie) { // Download trailer
    var url = movie.data.trailer
    var local = path.format({dir: config.locations.trailers, name: movie.id, ext: path.extname(url)}) // Local path of trailer

    try {
        var response = request('GET', url) // Download
    } catch (e) {
        throw new error.LoggedError('extractor/saveTrailer')
    }

    fs.writeFileSync(utility.absolute(utility.tmp(local)), response.getBody()) // Save it in a temporary folder
    movie.data.trailer = local // Update data with local path of trailer
}



// *** Exports ***

module.exports = {
    allocine: allocine,
    savePoster: savePoster,
    saveThumbnail: saveThumbnail,
    saveTrailer: saveTrailer
}
