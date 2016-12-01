// *** Libraries ***

const utility = require('./utility')

const fs = require('fs-plus')
const yaml = require('js-yaml')



// *** Config ***

const userConfigLocation = './config.yml'

let config = { // It creates the necessary parent directories | relative directories are based on the main process (bot.js)
    locations: {
        posters: './data/posters/full', // BE CAREFUL: THIS DIRECTORY IS REMOVED EACH PROCESS
        thumbnails: './data/posters/thumbnail', // BE CAREFUL: THIS DIRECTORY IS REMOVED EACH PROCESS
        trailers: './data/trailers', // BE CAREFUL: THIS DIRECTORY IS REMOVED EACH PROCESS
        db: './data/db.json',
        log: './logs/log.json'
    },
    sleep: 4000, // Delay between each movie
    thumbnail: {
        width: 170 * 2, // Retina display (* 2)
        height: 227 * 2 // Retina display (* 2)
    },
    percentage: 1, // Percentage precision,
    tags: {
        ignore: 'ignore' // Tag to ignore a movie
    }
}

config = Object.assign(config, yaml.safeLoad(fs.readFileSync(utility.absolute(userConfigLocation), 'utf8'))) // Add user config



// *** Exports ***

module.exports = config
