// *** Imports ***

const fs = require('fs-extra')
const yaml = require('js-yaml')

const utility = require('./utility')



// *** Config ***

const profile = yaml.safeLoad(fs.readFileSync(utility.abs('./config.yml'), 'utf8')) // User config

const config = {
    locations: { // Relative directories are based on the main process (bot.js)
        posters: './data/posters/full', // WARNING: THIS DIRECTORY IS REMOVED EACH PROCESS
        thumbnails: './data/posters/thumbnail', // BE CAREFUL: THIS DIRECTORY IS REMOVED EACH PROCESS
        trailers: './data/trailers', // WARNING: THIS DIRECTORY IS REMOVED EACH PROCESS
        db: './data/db.json',
        log: './logs/log.json'
    },
    percentage: 2, // Percentage precision in log,
    thumbnail: {
        width: 170 * 2, // Retina display (* 2)
        height: 227 * 2 // Retina display (* 2)
    }
}



// *** Exports ***

module.exports = Object.assign(config, profile)
