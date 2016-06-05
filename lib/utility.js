// *** Libraries ***

var child = require('child_process')
var path = require('path')



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



// *** Exports ***

module.exports = {
    thumbnailer: thumbnailer,
    getAbsolutePath: getAbsolutePath
}
