// *** Libraries ***

var child = require('child_process')
var path = require('path')
var fs = require('fs')



// *** Utility ***

var thumbnailer = function (source, destination, width, height) { // Generate a thumbnail
    var args = [
        source,
        '-auto-orient',
        '-gravity',
        'Center',
        '-resize',
        width + 'x' + height + '+^',
        '-crop',
        width + 'x' + height + '+0+0',
        destination
    ]

    child.execFileSync('convert', args, {stdio: 'ignore'}) // Execute ImageMagick command
}

var getAbsolutePath = function (filename) {
    return /^\//.test(filename) ? filename : path.dirname(require.main.filename) + '/' + filename
}

var recursiveReaddirSync = function(directory, filter, callback) { // Get interesting "files" recursively through a filter
    fs.readdirSync(directory).forEach(function (basename) {
        var p = path.join(directory, basename) // path
        var stats = fs.statSync(p)

        if (filter(directory, basename))
            callback(directory, basename) // handler with interesting "file"
        else if (stats.isDirectory())
            recursiveReaddirSync(p, filter, callback)
    })
}



// *** Exports ***

module.exports = {
    thumbnailer: thumbnailer,
    getAbsolutePath: getAbsolutePath,
    recursiveReaddirSync: recursiveReaddirSync
}
