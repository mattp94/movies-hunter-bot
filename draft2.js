// *** Libraries ***

var explorer = require('./lib/explorer.js')
var utility = require('./lib/utility.js')

var fs = require('fs')
var path = require('path')


// *** Draft 2 ***

// console.log(explorer.browse(['/Users/matthieu/Desktop/recursive-movies']))
// explorer.browse(['/Users/matthieu/Desktop/recursive-movies'])

var files = explorer.browse(['/Volumes/DVD/Films'], function (filename) {
    var stats = fs.statSync(filename)

    return stats.isFile() && /\.(mkv|avi|mp4|iso|img)$/i.test(pathname)
    return stats.isDirectory() && /\.(dvd)$/i.test(pathname)
})

console.log(files.map(file => file.filename))
