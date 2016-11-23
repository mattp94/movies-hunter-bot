// *** Libraries ***

var utility = require('./utility')

var fs = require('fs-plus')
var yaml = require('js-yaml')



// *** Config ***

var userConfigLocation = './config.yml'

var config = {
    locations: {
        posters: './data/posters/full', // BE CAREFUL: THIS DIRECTORY IS REMOVED EACH PROCESS
        thumbnails: './data/posters/thumbnail', // BE CAREFUL: THIS DIRECTORY IS REMOVED EACH PROCESS
        trailers: './data/trailers', // BE CAREFUL: THIS DIRECTORY IS REMOVED EACH PROCESS
        db: './data/db.json'
    },
    sleep: 1000, // Delay between each movie
    thumbnail: {
        width: 170 * 2, // Retina display (* 2)
        height: 227 * 2 // Retina display (* 2)
    }
}

config = Object.assign(config, yaml.safeLoad(fs.readFileSync(utility.absolute(userConfigLocation), 'utf8'))) // Add user's profile



// *** Exports ***

module.exports = config
