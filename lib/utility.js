// *** Libraries ***

const child = require('child_process')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')



// *** Utility ***

const thumbnailer = (src, dest, width, height) => { // Generate a thumbnail
    const args = [src, '-auto-orient', '-gravity', 'Center', '-resize', `${width}x${height}+^`, '-crop', `${width}x${height}+0+0`, dest]

    child.execFileSync('convert', args, {stdio: 'ignore'}) // Execute ImageMagick command
}

const ffprobe = pathname => { // Get video's metadata
    const args = ['-v', 'error', '-print_format', 'json', '-show_streams', pathname]

    try {
        const stdout = child.execFileSync('ffprobe', args, {stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8'}) // Execute FFprobe command
        const streams = JSON.parse(stdout).streams

        return streams
    } catch (e) {
        if (!e.message.includes('Invalid data found when processing input'))
            throw new Error(e.message)
    }
}

const resolution = (width, height) => { // Get video resolution tag like Ultra HD = 4K, Full HD = 1080p & HD = 720p
    if (width > 3840 - 960 || height > 2160 - 540)
        return 'Ultra HD'

    if (width > 1920 - 320 || height > 1080 - 180)
        return 'Full HD'

    if (width > 1280 - 128 || height > 720 - 72)
        return 'HD'
}

const channels = (channelLayout, channels) => { // Get audio channels tag like 5.1, 7.1 or 9.1 for example
    if (channelLayout)
        return channelLayout.replace('(side)', '')

    if (channels)
        return `${channels - 1}.1`
}

const absolute = pathname => path.isAbsolute(pathname) ? pathname : path.join(path.dirname(require.main.filename), pathname) // Get absolute pathname based on the main process' directory

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

    for (const basename of fs.readdirSync(directory)) {
        const pathname = path.join(directory, basename) // directory/basename
        const stats = fs.statSync(pathname)

        if (filter(pathname, stats))
            files.push({pathname, stats})
        else if (stats.isDirectory())
            files = files.concat(recursiveListSync(pathname, filter))
    }

    return files
}



// *** Exports ***

module.exports = {
    thumbnailer,
    ffprobe,
    resolution,
    channels,
    absolute,
    tmp,
    recursiveListSync
}
