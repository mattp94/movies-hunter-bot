// *** Libraries ***

var config = require('./config')
var utility = require('./utility')
var database = require('./database')

var fs = require('fs')
var path = require('path')


// *** Cleaner ***

var browse = function () {
    var files = []

    var directories = [
        utility.getAbsolutePath(config.locations.thumbnails),
        utility.getAbsolutePath(config.locations.posters),
        utility.getAbsolutePath(config.locations.trailers)
    ]

    directories.forEach(function (directory) {
        fs.readdirSync(directory).forEach(function (basename) {
            var pathname = path.join(directory, basename) // directory/basename

            if (fs.statSync(pathname).isFile())
                files.push(pathname)
        })
    })

    return files
}

var clean = function () {
    var files = browse()

    files.forEach(function (file) {
        var id = path.basename(file, path.extname(file))

        if (!database.findOneFromId(id))
            fs.unlinkSync(file)
    })
}



// *** Exports ***

module.exports = {
    clean: clean
}
