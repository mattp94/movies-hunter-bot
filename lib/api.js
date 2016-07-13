// *** Libraries ***

var request = require('sync-request')
var cheerio = require('cheerio')
var querystring = require('querystring')
var moment = require('moment')
var crypto = require('crypto')
var sortObj = require('sort-object')



// *** API ***

var google = function (search, tld, lang, results) { // Get Google results from keywords
    var response = request('GET', encodeURI('https://www.google.' + tld + '/search?hl=' + lang + '&q=' + search + '&start=0&sa=N&num=' + results + '&ie=UTF-8&oe=UTF-8&gws_rd=ssl'))
    var $ = cheerio.load(response.getBody('utf8')) // Use cheerio for parsing html

    var results = []

    $('h3.r a').each(function (i, element) { // Get only urls
        var qsObj = querystring.parse($(element).attr('href'))

        if (qsObj['/url?q'])
            results.push(qsObj['/url?q'])
    })

    return results
}

var allocine = function (code) { // Get AlloCiné data from movie code
    var config = {
        api: 'http://api.allocine.fr/rest/v3/movie',
        secretKey: 'e2b7fd293906435aa5dac4be670e7982',
        params: {
            code: code,
            format: 'json',
            profile: 'large',
            partner: 'V2luZG93czg',
            sed: moment().format('YYYYMMDD')
        },
        userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; MSAppHost/1.0)'
    }

    var params = querystring.stringify(sortObj(config.params)) // Get params as string
    var sig = encodeURIComponent(crypto.createHash('sha1').update(config.secretKey + params, 'utf8').digest('base64')) // Build and hash sig param
    var url = config.api + '?' + params + '&sig=' + sig // Concat final url

    var response = request('GET', url, {headers: {'user-agent': config.userAgent}})
    var data = JSON.parse(response.getBody('utf8')).movie

    return data
}



// *** Exports ***

module.exports = {
    google: google,
    allocine: allocine
}
