// *** Libraries ***

var utility = require('./utility')

var fs = require('fs-plus')
var path = require('path')
var _ = require('lodash')
var tnp = require('torrent-name-parser')
var uuid = require('uuid')



// *** Explorer ***

var browse = function (directories, filter) { // Get movies + metadata through filter sorted by creation date
    var files = []

    directories.forEach(function (directory) { // For each directories specified in user config
        utility.recursiveListSync(directory, filter).forEach(function (filename) { // Get only interesting file through a filter
            var stats = fs.statSync(filename)

            var file = {
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
        })
    })

    return _.orderBy(files, 'date', 'desc') // Sort files by creation date
}

var metadata = { // Add metadata in a movie
    search: function (file) { // Add search as beautified name
        var name = path.basename(file.base, path.extname(file.base)).replace(/0+PV[0-9]* */i, '') // 0PV notation
                                                                    .replace(/\[([^\[\]]+)\]/g, '') // Legacy: [1080p] notation
                                                                    .replace(/{{[^{}]+}}/g, '') // Tags notation
                                                                    .replace(/^(Top\-Film\.Net\-|zest\-|ZT\.|fhd\-|ulshd\-|ift\-|IMAX|prem\.|figaro\-|fido\-|Kis\.uykusu\.|bd14\-|\[ Upload3ur \])/ig, '') // Some annoying prefix
                                                                    .trim()

        var parsed = tnp(name) // Parsed with torrent-name-parser lib

        file.search = parsed.title + (parsed.year ? ' ' + parsed.year : '')

        return metadata
    },

    quality: function (file, filename, stats) { // Add movie's quality (1080p or 720p)
        if (stats.isFile()) {
            var resolution = utility.videoResolution(filename)

            if (resolution)
                if (resolution.width > 1280 || resolution.height > 720)
                    file.quality = '1080p'
                else if (resolution.width > 720 || resolution.height > 576)
                    file.quality = '720p'
        }

        return metadata
    },

    tags: function (file) { // Add tags as e.g. {{tag1}} {{tag2}} {{tag3}}
        var tags = file.base.match(/{{[^{}]+}}/g) // Get all {{tags}}

        if (tags !== null) {
            file.tags = []

            tags.forEach(function (tag) {
                file.tags.push(tag.replace(/[{}]/g, '')) // Remove {{}}
            })
        }

        return metadata
    }
}



// *** Exports ***

module.exports = {
    browse: browse
}
