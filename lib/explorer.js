// *** Libraries ***

var utility = require('./utility')
var config = require('./config')

var fs = require('fs')
var path = require('path')
var moment = require('moment')
var _ = require('lodash')
var tnp = require('torrent-name-parser')



// *** Explorer ***

var browse = function (directories, filter) { // Get movies + metadata through filter sorted by creation date
    var files = []

    directories.forEach(function (directory) {
        utility.recursiveReaddirSync(directory, filter).forEach(function (filename) {
            var stats = fs.statSync(filename)
            var file = _.pick(path.parse(filename), ['dir', 'base'])

            file.inode = stats.ino
            file.date = stats.ctime

            addMetadata.search(file)
                       .quality(file, filename, stats)
                       .tags(file)

            if (!(file.tags && file.tags.includes(config.tags.ignore))) // Check if it contains {{ignore}} tag
                files.push(file)
        })
    })

    return _.orderBy(files, 'date', 'desc') // Sort files by creation date
}

var addMetadata = {
    search: function (file) { // Add search as beautified name
        var name = path.basename(file.base, path.extname(file.base)).replace(/0+PV[0-9]* */i, '')
                                                                    .replace(/\[([^\[\]]+)\]/g, '')
                                                                    .replace(/{{[^{}]+}}/g, '')
                                                                    .trim()

        var parsed = tnp(name)

        file.search = parsed.title + (parsed.year ? ' ' + parsed.year : '')

        return addMetadata
    },

    quality: function (file, filename, stats) { // Add movie's quality (1080p or 720p)
        if (stats.isFile()) {
            var resolution = utility.getVideoResolution(filename)

            if (resolution)
                if (resolution.width > 1280 || resolution.height > 720)
                    file.quality = '1080p'
                else if (resolution.width > 720 || resolution.height > 576)
                    file.quality = '720p'
        }

        return addMetadata
    },

    tags: function (file) { // Add tags as e.g. {{tag1}} {{tag2}} {{tag3}}
        var tags = file.base.match(/{{[^{}]+}}/g) // Get all {{tags}}

        if (tags !== null) {
            file.tags = []

            tags.forEach(function (tag) {
                file.tags.push(tag.replace(/[{}]/g, '')) // Remove {{}}
            })
        }

        return addMetadata
    }
}



// *** Exports ***

module.exports = {
    browse: browse
}
