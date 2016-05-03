// *** Libraries declaration ***

var fs = require('fs')
var moment = require('moment')



// *** Explorer class ***

function Explorer() {

    this.browse = function (directories) { // Get folders with metadata sorted by creation date
        var folders = []

        directories.forEach(function (directory) {
            fs.readdirSync(directory).forEach(function (element) {
                var stats = fs.statSync(directory + '/' + element)

                if (stats.isDirectory() && element != '@eaDir') // Only folders different to @eaDir
                    folders.push(addTags(addQuality(addSearch(addDate({
                        dirname: directory,
                        basename: element
                    }, stats)))))
            })
        })

        return sortByDate(folders)
    }

    function addDate(folder, stats) { // Add folder creation date (read or create hidden file)
        var date

        try {
            date = fs.readFileSync(folder.dirname + '/' + folder.basename + '/.date', 'utf8')
        } catch (error) {
            date = moment(stats.mtime).format('YYYY-MM-DD HH:mm:ss')
            fs.writeFileSync(folder.dirname + '/' + folder.basename + '/.date', date)
        }

        folder.date = date
        
        return folder
    }

    function addSearch(folder) { // Add search as beautified basename
        folder.search = folder.basename.replace(/0+PV[0-9]* */i, '')
                                       .replace(/\[([^\[\]]+)\]/g, '')
                                       .replace(/{{[^{}]+}}/g, '')
                                       .replace(/\.([0-9]{4}|french|multi|bluray|vostfr|[0-9]{3,4}p|dvdrip)\..*/i, '')
                                       .toLowerCase()
                                       .trim()

        return folder
    }

    function addQuality(folder) { // Add movie's quality e.g. [1080p]
        var quality = /\[([^\[\]]+)\]/.exec(folder.basename)

        if (quality !== null)
            folder.quality = quality[1]

        return folder
    }

    function addTags(folder) { // Add tags as e.g. {{tag1}} {{tag2}} {{tag3}}
        var tags = folder.basename.match(/{{[^{}]+}}/g)

        if (tags !== null) {
            folder.tags = []

            tags.forEach(function (tag) {
                folder.tags.push(tag.replace(/[{}]/g, ''))
            })
        }

        return folder
    }

    function sortByDate(folders) { // Sort folders by creation date
        return folders.sort(function (a, b) {
            if (a.date < b.date)
                return 1

            if (a.date > b.date)
                return -1

            return 0
        })
    }


}

module.exports = Explorer
