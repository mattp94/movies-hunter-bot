// *** Libraries ***

var api = require('./api.js')
var utility = require('./utility.js')
var config = require('./config.js')

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

            if (result.originalTitle)
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
                data.productionYear = result.productionYear

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
                    local: {
                        full: config.locations.posters + code + path.extname(result.poster.href),
                        thumbnail: config.locations.thumbnails + code + path.extname(result.poster.href)
                    },
                    online: result.poster.href.replace('http://images.allocine.fr', 'http://fr.web.img4.acsta.net') // Use a CDN which is more reliable
                }
            }

            if (result.trailer && result.trailer.href) {
                var href = api.allocine.trailer(code, result.trailer.code)

                if (href) {
                    data.trailer = {
                        local: config.locations.trailers + code + path.extname(href),
                        online: href
                    }
                }
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

var savePoster = function (poster) { // Download poster + generate a thumbnail
    var full = utility.getAbsolutePath(poster.local.full) // Full local path
    var thumbnail = utility.getAbsolutePath(poster.local.thumbnail) // Thumbnail local path

    var response = request('GET', poster.online) // Download
    fs.writeFileSync(full, response.getBody()) // Save

    utility.thumbnailer(full, thumbnail, config.thumbnail.width, config.thumbnail.height) // Generate a thumbnail
}

var saveTrailer = function (trailer) { // Download trailer
    var local = utility.getAbsolutePath(trailer.local) // Full local path

    var response = request('GET', trailer.online) // Download
    fs.writeFileSync(local, response.getBody()) // Save
}



// *** Exports ***

module.exports = {
    allocine: allocine,
    savePoster: savePoster,
    saveTrailer: saveTrailer
}
