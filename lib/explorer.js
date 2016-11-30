// *** Libraries ***

const utility = require('./utility')

const fs = require('fs-plus')
const path = require('path')
const _ = require('lodash')
const tnp = require('torrent-name-parser')
const uuid = require('uuid')



// *** Explorer ***

const browse = (directories, filter) => { // Get movies + metadata through filter sorted by creation date
    const files = []

    for (const directory of directories) { // For each directories specified in user config
        for (const filename of utility.recursiveListSync(directory, filter)) { // Get only interesting file through a filter defined in bot.js
            const stats = fs.statSync(filename)

            const file = {
                id: uuid(),
                dir: path.dirname(filename),
                base: path.basename(filename),
                inode: stats.ino,
                date: stats.ctime
            }

            metadata.search(file)
                    .quality(file, filename, stats)
                    .tags(file)

            if (!(file.tags && file.tags.includes('ignore'))) // Check if it contains {{ignore}} tag
                files.push(file)
        }
    }

    return _.orderBy(files, 'date', 'desc') // Sort files by creation date
}

const metadata = { // Add metadata in a movie
    search: file => { // Add search as beautified name
        const name = path.basename(file.base, path.extname(file.base)).replace(/0+PV[0-9]* */i, '') // 0PV notation
                                                                      .replace(/\[([^\[\]]+)\]/g, '') // Legacy: [1080p] notation
                                                                      .replace(/{{[^{}]+}}/g, '') // Tags notation
                                                                      .replace(/^(Top\-Film\.Net\-|zest\-|ZT\.|fhd\-|ulshd\-|ift\-|IMAX|prem\.|figaro\-|fido\-|Kis\.uykusu\.|bd14\-|\[ Upload3ur \])/ig, '') // Some annoying prefix
                                                                      .trim()

        const parsed = tnp(name) // Parsed with torrent-name-parser lib

        file.search = parsed.title + (parsed.year ? ' ' + parsed.year : '')

        return metadata // Chain metadata methods between them
    },

    quality: (file, filename, stats) => { // Add movie's quality (1080p or 720p)
        if (stats.isFile()) {
            const resolution = utility.videoResolution(filename)

            if (resolution)
                if (resolution.width > 1280 || resolution.height > 720)
                    file.quality = '1080p'
                else if (resolution.width > 720 || resolution.height > 576)
                    file.quality = '720p'
        }

        return metadata // Chain metadata methods between them
    },

    tags: file => { // Add tags as e.g. {{tag1}} {{tag2}} {{tag3}}
        const tags = file.base.match(/{{[^{}]+}}/g) // Get all {{tags}}

        if (tags !== null) {
            file.tags = []

            for (const tag of tags)
                file.tags.push(tag.replace(/[{}]/g, '')) // Remove {{}}
        }

        return metadata // Chain metadata methods between them
    }
}



// *** Exports ***

module.exports = {
    browse
}
