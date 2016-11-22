// *** Libraries ***

var utility = require('./utility')

var fs = require('fs')
var yaml = require('js-yaml')



// *** Config ***

var userConfigLocation = './config.yml'

var config = {
    locations: {
        posters: './data/posters/full',
        thumbnails: './data/posters/thumbnail',
        trailers: './data/trailers',
        db: './data/db.json'
    },
    sleep: 1000,
    thumbnail: {
        width: 170 * 2, // Retina display
        height: 227 * 2
    }
}

config = Object.assign(config, yaml.safeLoad(fs.readFileSync(utility.getAbsolutePath(userConfigLocation), 'utf8'))) // Add user's profile



// *** Exports ***

module.exports = config
