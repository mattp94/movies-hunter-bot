// *** Imports ***

const ffmpeg = require('fluent-ffmpeg')
const klaw = require('klaw')
const path = require('path')
const ptn = require('parse-torrent-name')
const uuid = require('uuid')
const _ = require('lodash')

const config = require('./config')
const utility = require('./utility')



// *** Explorer ***

const browse = async (directories, filter) => { // Get (filtered) movies & metadata sorted by creation date
    const promises = []
    const files = []

    await Promise.all(directories.map(directory => new Promise((resolve, reject) => { // For each directories specified in user config
        const walker = klaw(directory) // It will recursively browse the directory

        walker.on('data', file => {
            if (filter(file.path, file.stats)) // Get only interesting file through a filter defined in bot.js
                promises.push(new Promise((resolve, reject) => {
                    ffmpeg.ffprobe(file.path, (err, metadata) => { // Get video's metadata with ffprobe
                        if (err && !err.message.includes('Invalid data found when processing input'))
                            reject(err)
                        else
                            resolve({
                                pathname: file.path,
                                stats: file.stats,
                                streams: metadata ? metadata.streams : null
                            })
                    })
                }))
        })

        walker.on('error', err => {
            reject(err)
        })

        walker.on('end', () => {
            resolve()
        })
    })))

    for (const { pathname, stats, streams } of await Promise.all(promises)) {
        const file = {
            id: uuid(),
            dir: path.dirname(pathname),
            base: path.basename(pathname),
            inode: stats.ino,
            date: stats.mtime,
            search: metadata.search(pathname),
            quality: metadata.quality(pathname, streams),
            tags: metadata.tags(pathname)
        }

        const hasTagIgnore = utility.hasTag(file.tags, 'ignore')

        if (!hasTagIgnore)
            files.push(file)
    }

    return _.orderBy(files, 'date', 'desc') // Sort files by creation date
}

const metadata = { // Add metadata in a movie
    search: pathname => { // Add search as beautified name
        const name = path.basename(pathname, path.extname(pathname)).replace(/^ *§/, '') // Remove unseen notation (§)
                                                                    .replace(/{{[^{}]+}}/g, '') // Remove tags notation
                                                                    .replace(/(-|\(|\))/g, ' ') // To cope with issue with ptn
                                                                    .replace(/ {2,}/g, ' ')
                                                                    .trim()

        const parsed = ptn(name)

        return parsed.title + (parsed.year ? ' ' + parsed.year : '')
    },

    quality: (pathname, streams) => { // Add movie's quality (3D / 1080p / 5.1)
        const quality = {}

        if (/3D/i.test(path.basename(pathname)))
            quality['3D'] = true

        if (streams) {
            const vStream = _.chain(streams.filter(stream => stream.codec_type === 'video' && stream.codec_name !== 'mjpeg')).orderBy(['height', 'width']).last().value() // Get the best video stream
            const aStream = _.chain(streams.filter(stream => stream.codec_type === 'audio' && stream.channels > 5)).orderBy('channels').last().value() // Get the best audio stream

            const resolution = vStream ? utility.resolution(vStream.width, vStream.height) : null // Get resolution tag
            const channels = aStream ? utility.channels(aStream.channel_layout, aStream.channels) : null // Get channels tag

            if (resolution)
                quality.video = resolution

            if (channels)
                quality.audio = channels
        }

        if (!_.isEmpty(quality))
            return quality
    },

    tags: pathname => { // Add tags as e.g. {{tag1}} {{tag2}} {{tag3}}
        const tags = path.basename(pathname).match(/{{[^{}]+}}/g) // Get all {{tags}}

        if (tags !== null)
            return tags.map(tag => tag.replace(/[{}]/g, '')) // Remove {{}}
    }
}



// *** Exports ***

module.exports = {
    browse
}
