// *** Libraries ***

var utility = require('./utility')

var fs = require('fs')
var path = require('path')
var moment = require('moment')
var _ = require('lodash')



// *** Explorer ***

var browse = function (directories, filter) { // Get movies + metadata through filter sorted by creation date
    var files = []

    directories.forEach(function (directory) {
        utility.recursiveReaddirSync(directory, filter).forEach(function (filename) {
            var stats = fs.statSync(filename)

            var file = {
                dirname: path.dirname(filename),
                basename: path.basename(filename),
                inode: stats.ino,
                date: stats.ctime
            }

            addMetadata.search(file)
                       .quality(file, filename)
                       .tags(file)

            files.push(file)
        })
    })

    return _.orderBy(files, 'date', 'desc') // Sort files by creation date
}

var addMetadata = {
    search: function (file) { // Add search as beautified name
        file.search = file.filename.replace(/0+PV[0-9]* */i, '')
                                   .replace(/\[([^\[\]]+)\]/g, '')
                                   .replace(/{{[^{}]+}}/g, '')
                                   .replace(/\.([0-9]{4}|french|multi|bluray|vostfr|[0-9]{3,4}p|dvdrip)\..*/i, '')
                                   .toLowerCase()
                                   .trim()

        return addMetadata
    },

    quality: function (file, filename) { // Add movie's quality (1080p or 720p)
        var stats = fs.statSync(filename)
        var resolution

        if (stats.isFile()) {
            resolution = utility.getVideoResolution(filename)
        } else if (stats.isDirectory()) {
            var vobFiles = utility.recursiveReaddirSync(filename, function (pathname) {
                return fs.statSync(pathname).isFile() && /\.vob$/i.test(pathname)
            })

            if (vobFiles.length > 0)
                resolution = utility.getVideoResolution(vobFiles[0])
        }

        if (resolution)
            if (file.width > 1280 || file.height > 720)
                file.quality = '1080p'
            else if (file.width > 720 || file.height > 576)
                file.quality = '720p'

        return addMetadata
    },

    tags: function (file) { // Add tags as e.g. {{tag1}} {{tag2}} {{tag3}}
        var tags = file.filename.match(/{{[^{}]+}}/g) // Get all {{tags}}

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
