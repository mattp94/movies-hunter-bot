// *** Libraries ***

const child = require('child_process')
const path = require('path')
const fs = require('fs-plus')
const _ = require('lodash')



// *** Utility ***

const thumbnailer = (src, dest, width, height) => { // Generate a thumbnail (create directory if not exists)
    const args = [
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

const videoResolution = filename => { // Get width & height of a video
    const args = [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_streams',
        filename
    ]

    try {
        const stdout = child.execFileSync('ffprobe', args, {stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8'}) // Execute FFmpeg command
        const streams = JSON.parse(stdout).streams

        for (const stream of streams)
            if (Number.isInteger(stream.width) && Number.isInteger(stream.height))
                return _.pick(stream, ['width', 'height'])
    } catch (e) {}
}

const absolute = pathname => path.isAbsolute(pathname) ? pathname : path.join(path.dirname(require.main.filename), pathname) // Get absolute pathname based on main process' directory

const tmp = (pathname, itself) => { // Get temporary path, e.g., data/trailers-tmp/db.json or data/trailers/db-tmp.json
    const parsed = _.pick(path.parse(pathname), ['dir', 'name', 'ext'])

    if (itself)
        parsed.name += '-tmp'
    else
        parsed.dir += '-tmp'

    return path.format(parsed)
}

const recursiveListSync = (directory, filter) => { // Get interesting "files" recursively through a filter
    let files = []

    for (const pathname of fs.listSync(directory))
        if (filter(pathname))
            files.push(pathname)
        else if (fs.isDirectorySync(pathname))
            files = files.concat(recursiveListSync(pathname, filter))

    return files
}



// *** Exports ***

module.exports = {
    thumbnailer,
    videoResolution,
    absolute,
    tmp,
    recursiveListSync
}
