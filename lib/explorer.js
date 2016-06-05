// *** Libraries ***

var fs = require('fs')
var moment = require('moment')
var _ = require('lodash')



// *** Explorer ***

var browse = function (directories) { // Get folders with metadata sorted by creation date
    var folders = []

    directories.forEach(function (directory) {
        fs.readdirSync(directory).forEach(function (element) {
            var stats = fs.statSync(directory + '/' + element)

            if (stats.isDirectory() && element != '@eaDir') { // Only folders different to @eaDir
                var folder = {
                    inode: stats.ino,
                    dirname: directory,
                    basename: element
                }

                addMetadata.date(folder, stats)
                           .search(folder)
                           .quality(folder)
                           .tags(folder)

                folders.push(folder)
            }
        })
    })

    return _.orderBy(folders, 'date', 'desc') // Sort folders by creation date
}

var addMetadata = {
    date: function (folder, stats) { // Add folder creation date (read or create hidden file)
        var date

        try {
            date = fs.readFileSync(folder.dirname + '/' + folder.basename + '/.date', 'utf8')
        } catch (error) {
            date = moment(stats.mtime).format()
            fs.writeFileSync(folder.dirname + '/' + folder.basename + '/.date', date)
        }

        folder.date = date

        return addMetadata
    },

    search: function (folder) { // Add search as beautified basename
        folder.search = folder.basename.replace(/0+PV[0-9]* */i, '')
                                       .replace(/\[([^\[\]]+)\]/g, '')
                                       .replace(/{{[^{}]+}}/g, '')
                                       .replace(/\.([0-9]{4}|french|multi|bluray|vostfr|[0-9]{3,4}p|dvdrip)\..*/i, '')
                                       .toLowerCase()
                                       .trim()

        return addMetadata
    },

    quality: function (folder) { // Add movie's quality e.g. [1080p]
        var quality = /\[([^\[\]]+)\]/.exec(folder.basename)

        if (quality !== null)
            folder.quality = quality[1]

        return addMetadata
    },

    tags: function (folder) { // Add tags as e.g. {{tag1}} {{tag2}} {{tag3}}
        var tags = folder.basename.match(/{{[^{}]+}}/g) // Get all {{tags}}

        if (tags !== null) {
            folder.tags = []

            tags.forEach(function (tag) {
                folder.tags.push(tag.replace(/[{}]/g, '')) // Remove {{}}
            })
        }

        return addMetadata
    }
}



// *** Exports ***

module.exports = {
    browse: browse
}
