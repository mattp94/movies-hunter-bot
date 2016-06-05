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
        var result = api.allocine(code)

        if (result) {
            var data = {code: code}

            if ('title' in result)
                data.title = result.title

            if ('originalTitle' in result)
                data.originalTitle = result.originalTitle

            if ('nationality' in result) {
                data.nationality = []

                result.nationality.forEach(function (element) {
                    if ('$' in element)
                        data.nationality.push(element.$)
                })
            }

            if ('genre' in result) {
                data.genre = []

                result.genre.forEach(function (element) {
                    if ('$' in element)
                        data.genre.push(element.$)
                })
            }

            if ('release' in result && 'releaseDate' in result.release)
                data.releaseDate = result.release.releaseDate

            if ('productionYear' in result)
                data.productionYear = result.productionYear

            if ('runtime' in result)
                data.runtime = result.runtime

            if ('synopsis' in result)
                data.synopsis = striptags(result.synopsis, ['br']) // Remove html tags except <br>

            if ('castingShort' in result) {
                if ('directors' in result.castingShort)
                    data.directors = result.castingShort.directors.split(', ')

                if ('actors' in result.castingShort)
                    data.actors = result.castingShort.actors.split(', ')
            }

            if ('poster' in result && 'href' in result.poster) {
                data.poster = {
                    local: {
                        original: config.locations.posters + code + path.extname(result.poster.href),
                        thumbnail: config.locations.thumbnails + code + path.extname(result.poster.href)
                    },
                    online: result.poster.href.replace('http://images.allocine.fr', 'http://fr.web.img4.acsta.net') // Use a CDN which is more reliable
                }
            }

            if ('trailer' in result && 'href' in result.trailer)
                data.trailer = result.trailer.href

            if ('statistics' in result) {
                data.rating = {}

                if ('pressRating' in result.statistics)
                    data.rating.press = result.statistics.pressRating

                if ('userRating' in result.statistics)
                    data.rating.user = result.statistics.userRating
            }

            return data
        }

        return result // return undefined
    }
}

var savePoster = function (movie) { // Download poster + generate a thumbnail
    var original = utility.getAbsolutePath(movie.poster.local.original) // Original local path
    var thumbnail = utility.getAbsolutePath(movie.poster.local.thumbnail) // Thumbnail local path

    var response = request('GET', movie.poster.online) // Download picture
    fs.writeFileSync(original, response.getBody()) // Save it

    utility.thumbnailer(original, thumbnail, config.thumbnail.width, config.thumbnail.height) // Generate a thumbnail
}



// *** Exports ***

module.exports = {
    allocine: allocine,
    savePoster: savePoster
}
