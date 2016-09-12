// *** Libraries ***

var fs = require('fs')
var moment = require('moment')
var _ = require('lodash')



// *** Explorer ***

var browse = function (directories) { // Get files with metadata sorted by creation date
    var files = []

    directories.forEach(function (directory) {
        fs.readdirSync(directory).forEach(function (element) {
            var stats = fs.statSync(directory + '/' + element)

            if (stats.isDirectory() && element != '@eaDir') { // Only files different to @eaDir
                var file = {
                    inode: stats.ino,
                    dirname: directory,
                    basename: element
                }

                addMetadata.date(file, stats)
                           .search(file)
                           .quality(file)
                           .tags(file)

                files.push(file)
            }
        })
    })

    return _.orderBy(files, 'date', 'desc') // Sort files by creation date
}

var addMetadata = {
    date: function (file, stats) { // Add file creation date (read or create hidden file)
        var date

        try {
            date = fs.readFileSync(file.dirname + '/' + file.basename + '/.date', 'utf8')
        } catch (error) {
            date = moment(stats.mtime).format()
            fs.writeFileSync(file.dirname + '/' + file.basename + '/.date', date)
        }

        file.date = date

        return addMetadata
    },

    search: function (file) { // Add search as beautified basename
        file.search = file.basename.replace(/0+PV[0-9]* */i, '')
                                       .replace(/\[([^\[\]]+)\]/g, '')
                                       .replace(/{{[^{}]+}}/g, '')
                                       .replace(/\.([0-9]{4}|french|multi|bluray|vostfr|[0-9]{3,4}p|dvdrip)\..*/i, '')
                                       .toLowerCase()
                                       .trim()

        return addMetadata
    },

    quality: function (file) { // Add movie's quality e.g. [1080p]
        var quality = /\[([^\[\]]+)\]/.exec(file.basename)

        if (quality !== null)
            file.quality = quality[1]

        return addMetadata
    },

    tags: function (file) { // Add tags as e.g. {{tag1}} {{tag2}} {{tag3}}
        var tags = file.basename.match(/{{[^{}]+}}/g) // Get all {{tags}}

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
