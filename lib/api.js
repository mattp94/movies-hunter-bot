// *** Libraries ***

const cheerio = require('cheerio')
const crypto = require('crypto')
const got = require('got')
const moment = require('moment')
const querystring = require('querystring')
const randomUa = require('random-ua')

const { LoggedError } = require('./error')



// *** API ***

const google = async (search, tld, lang) => { // Get Google results from keywords
    let response

    try {
        response = await got(`http://www.google.${tld}/search?hl=${lang}&q=${encodeURIComponent(search)}`, {
            headers: { 'User-Agent': randomUa.generate() } // Send http request with a random user-agent to cheat Google
        })
    } catch (e) {
        throw new LoggedError('api/google', e.statusCode || e.code)
    }

    const $ = cheerio.load(response.body) // Use cheerio for parsing html
    const results = []

    $('h3.r a').each((i, element) => { // Get only urls
        const href = $(element).attr('href')
        const url = querystring.parse(href)['/url?q'] || href // Extract url

        results.push(url)
    })

    return results
}

const allocine = resource => async code => { // AlloCiné api
    const params = querystring.stringify({ // Get params as string
        code,
        format: 'json',
        partner: 'V2luZG93czg',
        profile: 'medium',
        sed: moment().format('YYYYMMDD') // Sorted by name properties (mandatory)
    })

    const secretKey = 'e2b7fd293906435aa5dac4be670e7982';
    const sig = encodeURIComponent(crypto.createHash('sha1').update(secretKey + params, 'utf8').digest('base64')) // Build and hash sig param

    let response

    try {
        response = await got(`http://api.allocine.fr/rest/v3/${resource}?${params}&sig=${sig}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; MSAppHost/1.0)' } // Send http request with a special user-agent to bypass restriction
        })
    } catch (e) {
        throw new LoggedError(`api/allocine/${resource}`, e.statusCode || e.code)
    }

    return JSON.parse(response.body)[resource] // Return data (return undefined if the item doesn't exist)
}



// *** Exports ***

module.exports = {
    google,
    allocine: {
        movie: allocine('movie'), // Usage: allocine.movie(movieCode)
        trailer: allocine('media') // Usage: allocine.trailer(trailerCode)
    }
}
