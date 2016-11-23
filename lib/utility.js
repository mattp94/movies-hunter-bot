// *** Libraries ***

var child = require('child_process')
var path = require('path')
var fs = require('fs-plus')
var _ = require('lodash')



// *** Utility ***

var thumbnailer = function (src, dest, width, height) { // Generate a thumbnail (create directory if not exists)
    var destDir = path.dirname(dest)

    if (!fs.existsSync(destDir))
        fs.makeTreeSync(destDir) // Create directory if not exists

    var args = [
        src,
        '-auto-orient',
        '-gravity',
        'Center',
        '-resize',
        width + 'x' + height + '+^',
        '-crop',
        width + 'x' + height + '+0+0',
        dest
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
            return {
                width: parseInt(resolution[1]),
                height: parseInt(resolution[2])
            }
    } catch (e) {}
}

var getAbsolutePath = function (pathname) {
    return path.isAbsolute(pathname) ? pathname : path.join(path.dirname(require.main.filename), pathname)
}

var getTmpPath = function (pathname, itself) {
    var parsed = _.pick(path.parse(pathname), ['dir', 'name', 'ext'])

    if (itself)
        parsed.name += '-tmp'
    else
        parsed.dir += '-tmp'

    return path.format(parsed)
}

getTmpPath = pathname => pathname

var recursiveReaddirSync = function (directory, filter) { // Get interesting "files" recursively through a filter
    var files = []

    fs.readdirSync(directory).forEach(function (basename) {
        var pathname = path.join(directory, basename) // directory/basename

        if (filter(pathname))
            files.push(pathname)
        else if (fs.isDirectorySync(pathname))
            files = files.concat(recursiveReaddirSync(pathname, filter))
    })

    return files
}



// *** Exports ***

module.exports = {
    thumbnailer: thumbnailer,
    getVideoResolution: getVideoResolution,
    getAbsolutePath: getAbsolutePath,
    getTmpPath: getTmpPath,
    recursiveReaddirSync: recursiveReaddirSync
}
