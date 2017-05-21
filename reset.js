// *** Imports ***

const fs = require('fs-extra')

const config = require('./lib/config')
const utility = require('./lib/utility')



// *** Reset ***

const directories = [config.locations.posters, config.locations.thumbnails, config.locations.trailers]
const files = [config.locations.db, config.locations.log]

Promise.all([
    ...directories.map(pathname => fs.emptyDir(utility.abs(pathname))),
    ...files.map(pathname => fs.remove(utility.abs(pathname))),
    ...directories.map(pathname => fs.remove(utility.tmp(utility.abs(pathname), true)))
]).catch(err => {
    console.log(err)
})
