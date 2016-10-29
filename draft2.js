// *** Libraries ***

var explorer = require('./lib/explorer.js')
var utility = require('./lib/utility.js')

var fs = require ('fs')
var path = require('path')


// *** Draft 2 ***

// console.log(explorer.browse(['/Users/matthieu/Desktop/recursive-movies']))
// explorer.browse(['/Users/matthieu/Desktop/recursive-movies'])

// var files = explorer.browse(['/Users/matthieu/Desktop/recursive-movies'], function (filename) {
//     var stats = fs.statSync(filename)
//
//     if (stats.isFile() && /\.(mkv|avi|mp4|flv)$/i.test(filename))
//         return true
//
//     if (stats.isDirectory()) {
//         var basenames = fs.readdirSync(filename)
//
//         var videoTs = basenames.find(basename => basename.toLowerCase() === 'video_ts')
//         var audioTs = basenames.find(basename => basename.toLowerCase() === 'audio_ts')
//
//         if (videoTs && audioTs && fs.statSync(path.join(filename, videoTs)).isDirectory() && fs.statSync(path.join(filename, audioTs)).isDirectory())
//             return true
//     }
// })

var files = explorer.browse(['/Volumes/DVD/Films'], function (filename) {
    var stats = fs.statSync(filename)

    if (stats.isFile() && !/\.(mkv|avi|mp4|date|data|db|sub|DS_Store|idx|srt|mds|iso|img)$/i.test(filename)) // img / iso
        return true

    if (stats.isDirectory()) {
        var videoTs = fs.readdirSync(filename).find(basename => basename.toLowerCase() === 'video_ts')

        if (videoTs && fs.statSync(path.join(filename, videoTs)).isDirectory())
            return true
    }
})

console.log(files.map(file => file.filename))
