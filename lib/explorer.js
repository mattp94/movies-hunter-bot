// *** Libraries ***

var fs = require('fs')
var moment = require('moment')



// *** Explorer ***

var browse = function (directories) { // Get folders with metadata sorted by creation date
    var folders = []

    directories.forEach(function (directory) {
        fs.readdirSync(directory).forEach(function (element) {
            var stats = fs.statSync(directory + '/' + element)

            if (stats.isDirectory() && element != '@eaDir') // Only folders different to @eaDir
                folders.push(addMetadata.tags(addMetadata.quality(addMetadata.search(addMetadata.date({
                    dirname: directory,
                    basename: element
                }, stats)))))
        })
    })

    return sortByDate(folders)
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
        
        return folder
    },

    search: function (folder) { // Add search as beautified basename
        folder.search = folder.basename.replace(/0+PV[0-9]* */i, '')
                                       .replace(/\[([^\[\]]+)\]/g, '')
                                       .replace(/{{[^{}]+}}/g, '')
                                       .replace(/\.([0-9]{4}|french|multi|bluray|vostfr|[0-9]{3,4}p|dvdrip)\..*/i, '')
                                       .toLowerCase()
                                       .trim()

        return folder
    },

    quality: function (folder) { // Add movie's quality e.g. [1080p]
        var quality = /\[([^\[\]]+)\]/.exec(folder.basename)

        if (quality !== null)
            folder.quality = quality[1]

        return folder
    },

    tags: function (folder) { // Add tags as e.g. {{tag1}} {{tag2}} {{tag3}}
        var tags = folder.basename.match(/{{[^{}]+}}/g)

        if (tags !== null) {
            folder.tags = []

            tags.forEach(function (tag) {
                folder.tags.push(tag.replace(/[{}]/g, ''))
            })
        }

        return folder
    }
}

var sortByDate = function (folders) { // Sort folders by creation date
    return folders.sort(function (a, b) {
        if (a.date < b.date)
            return 1

        if (a.date > b.date)
            return -1

        return 0
    })
}



// *** Exports ***

module.exports = {
    browse: browse
}
