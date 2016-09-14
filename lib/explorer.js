// *** Libraries ***

var utility = require('./utility')

var fs = require('fs')
var path = require('path')
var moment = require('moment')
var _ = require('lodash')



// *** Explorer ***

var browse = function (directories) { // Get movies through filter isTarget with metadata sorted by creation date
    var files = []

    directories.forEach(function (directory) {
        utility.recursiveReaddirSync(directory, isTarget, function (dirname, basename) { // Callback to handle each movie
            var stats = fs.statSync(path.join(dirname, basename)) // dirname/basename

            var file = {
                inode: stats.ino,
                dirname: dirname,
                basename: basename,
                date: stats.ctime
            }

            addMetadata.search(file)
                       .quality(file)
                       .tags(file)

            files.push(file)
        })
    })

    return _.orderBy(files, 'date', 'desc') // Sort files by creation date
}

var isTarget = function (dirname, basename) {
    var stats = fs.statSync(path.join(dirname, basename)) // dirname/basename

    return stats.isFile()
}

var addMetadata = {
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
