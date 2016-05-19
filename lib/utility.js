// *** Libraries ***

var child = require('child_process')



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

    child.execFileSync('convert', args, {stdio: 'ignore'}) // Exec ImageMagick command
}



// *** Exports ***

module.exports = {
    thumbnailer: thumbnailer
}
