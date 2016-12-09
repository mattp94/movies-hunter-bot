// *** Libraries ***

const error = require('./error')

const request = require('sync-request')
const cheerio = require('cheerio')
const querystring = require('querystring')
const moment = require('moment')
const crypto = require('crypto')
const randomUa = require('random-ua')



// *** API ***

const google = (search, tld, lang, total) => { // Get Google results from keywords
    let response

    try {
        response = request('GET', encodeURI(`https://www.google.${tld}/search?hl=${lang}&q=${search}&start=0&sa=N&num=${total}&ie=UTF-8&oe=UTF-8&gws_rd=ssl`, {headers: {'user-agent': randomUa.generate()}})) // Send http request with a random user-agent in order to simulate a web browser
    } catch (e) {
        throw new error.LoggedError('api/google')
    }

    const $ = cheerio.load(response.getBody('utf8')) // Use cheerio for parsing html
    const results = []

    $('h3.r a').each((i, element) => { // Get only urls
        const qsObj = querystring.parse($(element).attr('href'))
        const url = qsObj['/url?q'] // Extract url

        if (url)
            results.push(url) // Add it in results array
    })

    return results
}

const allocine = resources => code => { // AlloCiné api
    const config = {
        api: 'http://api.allocine.fr/rest/v3/',
        secretKey: 'e2b7fd293906435aa5dac4be670e7982',
        params: {
            code,
            format: 'json',
            partner: 'V2luZG93czg',
            profile: 'medium',
            sed: moment().format('YYYYMMDD')
        }, // Order by name properties (mandatory)
        userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; MSAppHost/1.0)'
    }

    const params = querystring.stringify(config.params) // Get params as string
    const sig = encodeURIComponent(crypto.createHash('sha1').update(config.secretKey + params, 'utf8').digest('base64')) // Build and hash sig param
    const url = `${config.api}${resources}?${params}&sig=${sig}` // Concat final url

    let response

    try {
        response = request('GET', url, {headers: {'user-agent': config.userAgent}}) // Send http request with a special user-agent so as to bypass restriction
    } catch (e) {
        throw new error.LoggedError(`api/allocine/${resources}`)
    }

    return JSON.parse(response.getBody('utf8'))[resources] // Return data (return undefined if the item doesn't exist)
}



// *** Exports ***

module.exports = {
    google,
    allocine: {
        movie: allocine('movie'), // Usage: allocine.movie(movieCode)
        trailer: allocine('media') // Usage: allocine.trailer(trailerCode)
    }
}
