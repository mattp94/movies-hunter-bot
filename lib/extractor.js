// *** Libraries ***

var api = require('./api.js')

var fileExtension = require('file-extension')
var request = require('sync-request')
var fs = require('fs')
var easyimg = require('easyimage')



// *** Extractor ***

var allocine = {
    getCodes: function (search) {
        var results = api.google(search + ' allocine', 'fr', 'fr', 5)
        
        var codes = []
        var rAllocine = /http:\/\/www\.allocine\.fr\/film\/fichefilm_gen_cfilm=(\d+)\.html/i

        results.forEach(function (url) {
            var code = rAllocine.exec(url)

            if (code !== null)
                codes.push(code[1])
        })

        return codes
    },

    getData: function (code) {
        var result = api.allocine(code)
        var data = {}

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
            data.synopsis = result.synopsis

        if ('castingShort' in result) {
            if ('directors' in result.castingShort)
                data.directors = result.castingShort.directors.split(', ')

            if ('actors' in result.castingShort)
                data.actors = result.castingShort.actors.split(', ')
        }

        if ('poster' in result && 'href' in result.poster) {
            data.poster = {
                local: code + '.' + fileExtension(result.poster.href),
                online: result.poster.href
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
}

var downloadPoster = function (movie) {
    var response = request('GET', movie.poster.online)
    fs.writeFileSync(__dirname + '/../' + 'data/posters/' + movie.poster.local, response.getBody())

    easyimg.rescrop({ // Create a thumbnail
        src: __dirname + '/../' + 'data/posters/' + movie.poster.local,
        dst: __dirname + '/../' + 'data/thumbnails/' + movie.poster.local,
        width: 170,
        height: 227,
        fill: true
    })
}



// *** Exports ***

module.exports = {
    allocine: allocine,
    downloadPoster: downloadPoster
}
