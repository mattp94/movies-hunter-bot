// *** Libraries ***

var child = require('child_process')
var path = require('path')
var fs = require('fs-plus')
var _ = require('lodash')



// *** Utility ***

var thumbnailer = function (src, dest, width, height) { // Generate a thumbnail (create directory if not exists)
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

    fs.makeTreeSync(path.dirname(dest)) // Create directory if not exists

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

var absolute = function (pathname) { // Get absolute pathname based on directory of main process
    return path.isAbsolute(pathname) ? pathname : path.join(path.dirname(require.main.filename), pathname)
}

var tmp = function (pathname, itself) { // Get temporary path, e.g., data/trailers-tmp/db.json or data/trailers/db-tmp.json
    var parsed = _.pick(path.parse(pathname), ['dir', 'name', 'ext'])

    if (itself)
        parsed.name += '-tmp'
    else
        parsed.dir += '-tmp'

    return path.format(parsed)
}

var recursiveListSync = function (directory, filter) { // Get interesting "files" recursively through a filter
    var files = []

    fs.listSync(directory).forEach(function (pathname) {
        if (filter(pathname))
            files.push(pathname)
        else if (fs.isDirectorySync(pathname))
            files = files.concat(recursiveListSync(pathname, filter))
    })

    return files
}



// *** Exports ***

module.exports = {
    thumbnailer: thumbnailer,
    getVideoResolution: getVideoResolution,
    absolute: absolute,
    tmp: tmp,
    recursiveListSync: recursiveListSync
}
