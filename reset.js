// *** Imports ***

const chalk = require('chalk')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const rimraf = require('rimraf')

const config = require('./lib/config')
const utility = require('./lib/utility')



// *** Reset ***

const directories = [config.locations.posters, config.locations.thumbnails, config.locations.trailers]
const files = [config.locations.db, config.locations.log]

// Directories handler
for (let pathname of directories) {
    pathname = utility.absolute(pathname) // Get an absolute path relative to reset.js

    if (fs.existsSync(pathname)) { // Remove directory if exists
        rimraf.sync(pathname)
        console.log(chalk.red('(-)'), pathname)
    }

    const tmp = utility.tmp(pathname, true) // Temporary folder

    if (fs.existsSync(tmp)) { // Remove temporary folder if exists
        rimraf.sync(tmp)
        console.log(chalk.red('(-)'), tmp)
    }

    mkdirp.sync(pathname) // Create directory anyway
    console.log(chalk.green('(+)'), pathname)
}

// Files handler
for (let pathname of files) {
    pathname = utility.absolute(pathname) // Get an absolute path relative to reset.js

    const dir = path.dirname(pathname) // Parent

    if (fs.existsSync(pathname)) { // Remove file if exists
        fs.unlinkSync(pathname)
        console.log(chalk.red('(-)'), pathname)
    } else if (!fs.existsSync(dir)) { // Create parent if not exists
        mkdirp.sync(dir)
        console.log(chalk.green('(+)'), dir)
    }
}
