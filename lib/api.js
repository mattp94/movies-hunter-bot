// *** Libraries ***

const {LoggedError} = require('./error')

const request = require('sync-request')
const cheerio = require('cheerio')
const querystring = require('querystring')
const moment = require('moment')
const crypto = require('crypto')
const randomUa = require('random-ua')



// *** API ***

const google = (search, tld, lang) => { // Get Google results from keywords
    let body

    try {
        const response = request('GET', `http://www.google.${tld}/search?hl=${lang}&q=${encodeURIComponent(search)}`, {headers: {'user-agent': randomUa.generate()}}) // Send http request with a random user-agent to cheat Google
        body = response.getBody('utf8')
    } catch (e) {
        throw new LoggedError('api/google', e.statusCode || 'ENOTFOUND')
    }

    const $ = cheerio.load(body) // Use cheerio for parsing html
    const results = []

    $('h3.r a').each((i, element) => { // Get only urls
        const href = $(element).attr('href')
        const url = querystring.parse(href)['/url?q'] || href // Extract url

        results.push(url)
    })

    return results
}

const allocine = resources => code => { // AlloCiné api
    const config = {
        secretKey: 'e2b7fd293906435aa5dac4be670e7982',
        params: { // Sorted by name properties (mandatory)
            code,
            format: 'json',
            partner: 'V2luZG93czg',
            profile: 'medium',
            sed: moment().format('YYYYMMDD')
        }
    }

    const params = querystring.stringify(config.params) // Get params as string
    const sig = encodeURIComponent(crypto.createHash('sha1').update(config.secretKey + params, 'utf8').digest('base64')) // Build and hash sig param

    let body

    try {
        const response = request('GET', `http://api.allocine.fr/rest/v3/${resources}?${params}&sig=${sig}`, {headers: {'user-agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; MSAppHost/1.0)'}}) // Send http request with a special user-agent to bypass restriction
        body = response.getBody('utf8')
    } catch (e) {
        throw new LoggedError(`api/allocine/${resources}`, e.statusCode || 'ENOTFOUND')
    }

    return JSON.parse(body)[resources] // Return data (return undefined if the item doesn't exist)
}



// *** Exports ***

module.exports = {
    google,
    allocine: {
        movie: allocine('movie'), // Usage: allocine.movie(movieCode)
        trailer: allocine('media') // Usage: allocine.trailer(trailerCode)
    }
}
