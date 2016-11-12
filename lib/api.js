// *** Libraries ***

var error = require('./error')

var request = require('sync-request')
var cheerio = require('cheerio')
var querystring = require('querystring')
var moment = require('moment')
var crypto = require('crypto')



// *** API ***

var google = function (search, tld, lang, results) { // Get Google results from keywords
    try {
        var response = request('GET', encodeURI('https://www.google.' + tld + '/search?hl=' + lang + '&q=' + search + '&start=0&sa=N&num=' + results + '&ie=UTF-8&oe=UTF-8&gws_rd=ssl'))
    } catch (e) {
        throw new error.BotError('api/google')
    }

    var $ = cheerio.load(response.getBody('utf8')) // Use cheerio for parsing html
    var results = []

    $('h3.r a').each(function (i, element) { // Get only urls
        var qsObj = querystring.parse($(element).attr('href'))

        if (qsObj['/url?q'])
            results.push(qsObj['/url?q'])
    })

    return results
}

var allocine = {
    movie: function (code) { // Get AlloCiné data from movie code
        var config = {
            api: 'http://api.allocine.fr/rest/v3/movie',
            secretKey: 'e2b7fd293906435aa5dac4be670e7982',
            params: {
                code: code,
                format: 'json',
                partner: 'V2luZG93czg',
                profile: 'large',
                sed: moment().format('YYYYMMDD')
            },
            userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; MSAppHost/1.0)'
        }

        var params = querystring.stringify(config.params) // Get params as string
        var sig = encodeURIComponent(crypto.createHash('sha1').update(config.secretKey + params, 'utf8').digest('base64')) // Build and hash sig param
        var url = config.api + '?' + params + '&sig=' + sig // Concat final url

        try {
            var response = request('GET', url, {headers: {'user-agent': config.userAgent}})
        } catch (e) {
            throw new error.BotError('api/allocine/movie')
        }

        var data = JSON.parse(response.getBody('utf8')).movie

        return data
    },

    trailer: function (movieCode, trailerCode) {
        try {
            var response = request('GET', 'http://www.allocine.fr/video/player_gen_cmedia=' + trailerCode + '&cfilm=' + movieCode + '.html')
        } catch (e) {
            throw new error.BotError('api/allocine/trailer')
        }

        var $ = cheerio.load(response.getBody('utf8')) // Use cheerio for parsing html
        var model = $('#content-start figure.player.js-player').data('model') // Get model width urls in attribute data-model

        if (model) {
            if (model.sources) {
                if (model.sources.high)
                    return model.sources.high

                if (model.sources.medium)
                    return model.sources.medium
            }
        }
    }
}



// *** Exports ***

module.exports = {
    google: google,
    allocine: allocine
}
