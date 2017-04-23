// *** Libraries ***

const path = require('path')
const ptn = require('parse-torrent-name')
const uuid = require('uuid')
const _ = require('lodash')

const config = require('./config')
const utility = require('./utility')



// *** Explorer ***

const browse = (directories, filter) => { // Get movies + metadata through filter sorted by creation date
    const files = []

    for (const directory of directories) // For each directories specified in user config
        for (const {pathname, stats} of utility.recursiveListSync(directory, filter)) { // Get only interesting file through a filter defined in bot.js
            const file = {
                id: uuid(),
                dir: path.dirname(pathname),
                base: path.basename(pathname),
                inode: stats.ino,
                date: stats.mtime
            }

            metadata.search(file)
            metadata.quality(file, pathname, stats)
            metadata.tags(file)

            if (!(file.tags && file.tags.includes(config.tags.ignore))) // Check if it contains the {{ignore}} tag
                files.push(file)
        }

    return _.orderBy(files, 'date', 'desc') // Sort files by creation date
}

const metadata = { // Add metadata in a movie
    search: file => { // Add search as beautified name
        const name = path.basename(file.base, path.extname(file.base)).replace(/^ *§/i, '') // Unseen notation (§)
                                                                      .replace(/{{[^{}]+}}/g, '') // Tags notation
                                                                      .trim()

        const parsed = ptn(name) // Parsed with torrent-name-parser lib

        file.search = parsed.title + (parsed.year ? ' ' + parsed.year : '')
    },

    quality: (file, pathname, stats) => { // Add movie's quality (3D / 1080p / 5.1)
        if (/3D/i.test(file.base))
            _.set(file, 'quality.3D', true)

        if (stats.isFile()) {
            const streams = utility.ffprobe(pathname)

            if (streams) {
                const vStream = _.last(_.orderBy(streams.filter(stream => stream.codec_type === 'video' && stream.codec_name !== 'mjpeg'), ['height', 'width'])) // Get the best video stream
                const aStream = _.last(_.orderBy(streams.filter(stream => stream.codec_type === 'audio' && stream.channels > 5), 'channels')) // Get the best audio stream

                const resolution = vStream ? utility.resolution(vStream.width, vStream.height) : undefined // Get resolution tag
                const channels = aStream ? utility.channels(aStream.channel_layout, aStream.channels) : undefined // Get channels tag

                if (resolution)
                    _.set(file, 'quality.video', resolution)

                if (channels)
                    _.set(file, 'quality.audio', channels)
            }
        }
    },

    tags: file => { // Add tags as e.g. {{tag1}} {{tag2}} {{tag3}}
        const tags = file.base.match(/{{[^{}]+}}/g) // Get all {{tags}}

        if (tags !== null) {
            file.tags = []

            for (const tag of tags)
                file.tags.push(tag.replace(/[{}]/g, '')) // Remove {{}}
        }
    }
}



// *** Exports ***

module.exports = {
    browse
}
