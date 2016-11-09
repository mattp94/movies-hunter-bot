// *** Config ***

var config = {
    locations: {
        posters: 'data/posters/full',
        thumbnails: 'data/posters/thumbnail',
        trailers: 'data/trailers',
        db: 'data/db.json'
    },
    sleep: 1000,
    thumbnail: {
        width: 170 * 2, // Retina display
        height: 227 * 2
    },
    tags: {
        ignore: 'ignore'
    }
}

config = Object.assign(config, require('../config.json')) // Add user's profile

// *** Exports ***

module.exports = config
