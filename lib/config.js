// *** Imports ***

const fs = require('fs-extra')
const yaml = require('js-yaml')

const utility = require('./utility')



// *** Config ***

let config = { // Relative directories are based on the main process (bot.js)
    locations: {
        posters: './data/posters/full', // WARNING: THIS DIRECTORY IS REMOVED EACH PROCESS
        thumbnails: './data/posters/thumbnail', // BE CAREFUL: THIS DIRECTORY IS REMOVED EACH PROCESS
        trailers: './data/trailers', // WARNING: THIS DIRECTORY IS REMOVED EACH PROCESS
        db: './data/db.json',
        log: './logs/log.json'
    },
    sleep: { // Random delay between each movie (to cheat api & search engines)
        min: 5, // 5s ?
        max: 15 // 15s ?
    },
    thumbnail: {
        width: 185 * 2, // Retina display (* 2)
        height: 251 * 2 // Retina display (* 2)
    },
    percentage: 2, // Percentage precision,
    tags: {
        ignore: 'ignore' // Tag to ignore a movie
    }
}

config = Object.assign(config, yaml.safeLoad(fs.readFileSync(utility.absolute('./config.yml'), 'utf8'))) // Add user config



// *** Exports ***

module.exports = config
