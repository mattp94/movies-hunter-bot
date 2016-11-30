// *** Libraries ***

const error = require('./error')

const request = require('sync-request')
const cheerio = require('cheerio')
const querystring = require('querystring')
const moment = require('moment')
const crypto = require('crypto')



// *** API ***

const google = (search, tld, lang, total) => { // Get Google results from keywords
    let response

    try {
        response = request('GET', encodeURI('https://www.google.' + tld + '/search?hl=' + lang + '&q=' + search + '&start=0&sa=N&num=' + total + '&ie=UTF-8&oe=UTF-8&gws_rd=ssl')) // Send http request
    } catch (e) {
        throw new error.LoggedError('api/google')
    }

    const $ = cheerio.load(response.getBody('utf8')) // Use cheerio for parsing html
    const results = []

    $('h3.r a').each((i, element) => { // Get only urls
        const qsObj = querystring.parse($(element).attr('href')) // Extract url

        if (qsObj['/url?q'])
            results.push(qsObj['/url?q']) // Add it in results array
    })

    return results
}

const allocine = {
    movie: code => { // Get AlloCiné data from movie code
        const config = {
            api: 'http://api.allocine.fr/rest/v3/movie',
            secretKey: 'e2b7fd293906435aa5dac4be670e7982',
            params: {
                code,
                format: 'json',
                partner: 'V2luZG93czg',
                profile: 'large',
                sed: moment().format('YYYYMMDD')
            } // Order by name properties
        }

        const params = querystring.stringify(config.params) // Get params as string
        const sig = encodeURIComponent(crypto.createHash('sha1').update(config.secretKey + params, 'utf8').digest('base64')) // Build and hash sig param
        const url = config.api + '?' + params + '&sig=' + sig // Concat final url

        let response

        try {
            response = request('GET', url, {headers: {'user-agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; MSAppHost/1.0)'}}) // Send http request with a special user-agent so as to bypass restriction
        } catch (e) {
            throw new error.LoggedError('api/allocine/movie')
        }

        return JSON.parse(response.getBody('utf8')).movie // Return data
    },

    trailer: (movieCode, trailerCode) => { // Get AlloCiné trailer url from movie code and trailer code
        let response

        try {
            response = request('GET', 'http://www.allocine.fr/video/player_gen_cmedia=' + trailerCode + '&cfilm=' + movieCode + '.html', {headers: {'user-agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; MSAppHost/1.0)'}}) // Send http request with a special user-agent so as to bypass restriction
        } catch (e) {
            throw new error.LoggedError('api/allocine/trailer')
        }

        const $ = cheerio.load(response.getBody('utf8')) // Use cheerio for parsing html
        const model = $('#content-start figure.player.js-player').data('model') // Get model width urls in attribute data-model

        if (model)
            if (model.sources) {
                if (model.sources.high)
                    return model.sources.high // High quality

                if (model.sources.medium)
                    return model.sources.medium // Normal quality
            }
    }
}



// *** Exports ***

module.exports = {
    google,
    allocine
}
