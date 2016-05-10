// *** Libraries declaration ***

var request = require('sync-request')
var cheerio = require('cheerio')
var querystring = require('querystring')
var moment = require('moment')
var crypto = require('crypto')
var sortObj = require('sort-object')



// *** Extractor class ***

function Extractor() {

    function searchWithGoogle(search, tld, lang, results) {
        var response = request('GET', encodeURI('https://www.google.' + tld + '/search?hl=' + lang + '&q=' + search + '&start=0&sa=N&num=' + results + '&ie=UTF-8&oe=UTF-8&gws_rd=ssl'))
        var $ = cheerio.load(response.getBody('utf8'))

        var results = []

        $('h3.r a').each(function (i, element) {
            var qsObj = querystring.parse($(element).attr('href'))

            if (qsObj['/url?q'])
                results.push(qsObj['/url?q'])
        })

        return results
    }

    function getDataFromAllocine(code) {
        var config = {
            api: 'http://api.allocine.fr/rest/v3/movie',
            secretKey: 'e2b7fd293906435aa5dac4be670e7982',
            params: {
                code: code,
                format: 'json',
                profile: 'large',
                partner: 'V2luZG93czg',
                sed: moment().format('YYYYMMDD')
            }
        }
        
        var params = querystring.stringify(sortObj(config.params)) // Get params as string
        var sig = encodeURIComponent(crypto.createHash('sha1').update(config.secretKey + params, 'utf-8').digest('base64')) // Build and hash sig param
        var url = config.api + '?' + params + '&sig=' + sig // Concat final url
        
        var response = request('GET', url)
        var data = response.getBody('utf8')
        console.log(data)
    }

    this.test = getDataFromAllocine

}

module.exports = Extractor
