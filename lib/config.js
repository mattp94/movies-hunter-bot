// *** Libraries ***

const utility = require('./utility')

const fs = require('fs')
const yaml = require('js-yaml')



// *** Config ***

let config = { // Relative directories are based on the main process (bot.js)
    locations: {
        posters: './data/posters/full', // BE CAREFUL: THIS DIRECTORY IS REMOVED EACH PROCESS | You must create the directory prior to launch the bot
        thumbnails: './data/posters/thumbnail', // BE CAREFUL: THIS DIRECTORY IS REMOVED EACH PROCESS | You must create the directory prior to launch the bot
        trailers: './data/trailers', // BE CAREFUL: THIS DIRECTORY IS REMOVED EACH PROCESS | You must create the directory prior to launch the bot
        db: './data/db.json', // You must create the necessary parent directories prior to launch the bot
        log: './logs/log.json' // You must create the necessary parent directories prior to launch the bot
    },
    sleep: { // Random delay between each movie (to cheat api & search engines)
        min: 4000, // 30000
        max: 8000 // 70000
    },
    thumbnail: {
        width: 170 * 2, // Retina display (* 2)
        height: 227 * 2 // Retina display (* 2)
    },
    percentage: 2, // Percentage precision,
    tags: {
        ignore: 'ignore' // Tag to ignore a movie
    }
}

config = Object.assign(config, yaml.safeLoad(fs.readFileSync(utility.absolute('./config.yml'), 'utf8'))) // Add user config



// *** Exports ***

module.exports = config
