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

var getVideoResolution = function (filename) { // Get width & height of a video
    var args = [
        '-v',
        'error',
        '-show_streams',
        filename
    ]

    try {
        var stdout = child.execFileSync('ffprobe', args, {stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8'}) // Execute FFmpeg command
        var resolution = /width=(\d+)\nheight=(\d+)/i.exec(stdout)

        if (resolution)
            return {width: parseInt(resolution[1]), height: parseInt(resolution[2])}
    } catch (e) {}
}

var getAbsolutePath = function (pathname) {
    return path.isAbsolute(pathname) ? pathname : path.join(path.dirname(require.main.filename), pathname)
}

var recursiveReaddirSync = function (directory, filter) { // Get interesting "files" recursively through a filter
    var files = []

    fs.readdirSync(directory).forEach(function (basename) {
        var pathname = path.join(directory, basename) // directory/basename
        var stats = fs.statSync(pathname)

        if (filter(pathname))
            files.push(pathname)
        else if (stats.isDirectory())
            files = files.concat(recursiveReaddirSync(pathname, filter))
    })

    return files
}



// *** Exports ***

module.exports = {
    thumbnailer: thumbnailer,
    getVideoResolution: getVideoResolution,
    getAbsolutePath: getAbsolutePath,
    recursiveReaddirSync: recursiveReaddirSync
}
