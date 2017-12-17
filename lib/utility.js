// *** Imports ***

const path = require('path')
const pipe = require('multipipe')
const util = require('util')
const { execFile } = require('child_process')
const { pick } = require('lodash')



// *** Utility ***

const ffprobe = pathname => new Promise((resolve, reject) => { // Get video's metadata
    const args = ['-v', 'error', '-print_format', 'json', '-show_streams', pathname]

    execFile('ffprobe', args, (err, stdout) => {
        if (err)
            if (err.message.includes('Invalid data found when processing input'))
                resolve(null)
            else
                reject(err)
        else
            resolve(JSON.parse(stdout).streams)
    })
})

const resolution = (width, height) => { // Get video resolution tag like Ultra HD = 4K, Full HD = 1080p & HD = 720p
    if (width > 3840 - 960 || height > 2160 - 540)
        return 'Ultra HD'

    if (width > 1920 - 320 || height > 1080 - 180)
        return 'Full HD'

    if (width > 1280 - 128 || height > 720 - 72)
        return 'HD'
}

const channels = (channelLayout, channels) => { // Get audio channels tag like 5.1, 7.1 or 9.1 for example
    if (channelLayout && channelLayout !== 'unknown')
        return channelLayout.toString().replace('(side)', '')

    if (channels)
        return `${channels - 1}.1`
}

const abs = pathname => path.isAbsolute(pathname) ? pathname : path.join(path.dirname(require.main.filename), pathname) // Get absolute pathname based on the main process' directory

const tmp = (pathname, itself) => { // Get temporary path, e.g., data/trailers-tmp/db.json or data/trailers/db-tmp.json
    const parsed = pick(path.parse(pathname), ['dir', 'name', 'ext'])

    if (itself)
        parsed.name += '-tmp'
    else
        parsed.dir += '-tmp'

    return path.format(parsed)
}

const hasTag = (tags, tag) => tags && tags.includes(tag)



// *** Exports ***

module.exports = {
    ffprobe,
    resolution,
    channels,
    abs,
    tmp,
    hasTag,
    pipe: util.promisify(pipe)
}
