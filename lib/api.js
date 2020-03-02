// *** Imports ***

const cheerio = require('cheerio')
const got = require('got')
const querystring = require('querystring')
const randomUA = require('random-useragent')

const config = require('./config')
const { LoggedError } = require('./error')



// *** API ***

const google = async (search, tld, lang) => { // Get Google results from keywords
    let response

    const userAgent = randomUA.getRandom(
        element =>
            element.osName === 'Mac OS' &&
            element.browserName === 'Chrome' &&
            element.browserMajor >= 45
    )

    try {
        response = await got(`http://www.google.${tld}/search?hl=${lang}&q=${encodeURIComponent(search)}`, {
            headers: { 'User-Agent': userAgent } // Send http request with a random user-agent to cheat Google
        })
    } catch (err) {
        throw err.name === 'HTTPError' ? new LoggedError('api/google', err.statusCode) : err
    }

    const $ = cheerio.load(response.body) // Use cheerio for parsing html
    const results = []

    $('#search .r > a:first-child').each((i, element) => { // Get only urls
        const href = $(element).attr('href')
        const parsed = querystring.parse(href)

        const url = parsed['/url?q'] || // Extract url
                    parsed['/url?url'] ||
                    parsed[`http://www.google.${tld}/url?url`] ||
                    href

        results.push(url)
    })

    return results
}

const tmdb = resource => async code => { // TMDb api
    let response

    try {
        response = await got(`http://api.themoviedb.org/3/movie/${resource !== 'details' ? `${code}/${resource}` : code}?api_key=${config.tmdbKey}&language=fr-FR`)
    } catch (err) {
        throw err.name === 'HTTPError' ? new LoggedError(`api/tmdb/${resource}`, err.statusCode) : err
    }

    return JSON.parse(response.body)
}



// *** Exports ***

module.exports = {
    google,
    tmdb: {
        details: tmdb('details'), // Usage: tmdb.details(movieCode)
        credits: tmdb('credits') // Usage: tmdb.credits(movieCode)
    }
}
