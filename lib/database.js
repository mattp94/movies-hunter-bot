// *** Imports ***

const FileAsync = require('lowdb/adapters/FileAsync')
const fs = require('fs-extra')
const lowdb = require('lowdb')
const path = require('path')

const config = require('./config')
const utility = require('./utility')



// *** Database ***

let db

const init = async () => {
    await fs.ensureDir(utility.abs(path.dirname(config.locations.db)))

    const adapter = new FileAsync(utility.abs(config.locations.db)) // Async operations
    db = await lowdb(adapter) // Load database from json file

    await db.defaults({ movies: [], tmp: [] }) // Set default tables
            .write()
}

const findOneFromInode = (table, inode) => // Find a movie from inode (return undefined if not exists)
    db.get(table)
      .find(movie => db._.find(movie.files, { inode }))
      .value()

const findOneFromSearch = (table, search) => // Find a movie from search (return undefined if not exists)
    db.get(table)
      .find(movie => db._.find(movie.files, { search }))
      .value()

const findOneFromCode = (table, code, from) => // Find a movie from code (return undefined if not exists)
    db.get(table)
      .find({ data: { code, from } })
      .value()

const insert = async movie => { // Insert a movie with data
    await db.get('tmp')
            .push(movie)
            .write()
}

const update = async (duplicate, movie) => { // Push a movie without data (file only) to a duplicate
    await db.get('tmp')
            .find(duplicate)
            .get('files')
            .push(movie.files[0])
            .write()
}

const flush = async () => { // flush tmp in movies
    await db.set('movies', db.get('tmp').value()) // Replace movies by tmp
            .write()

    await db.unset('tmp') // Remove tmp
            .write()
}



// *** Exports ***

module.exports = {
    init,
    findOneFromInode,
    findOneFromSearch,
    findOneFromCode,
    insert,
    update,
    flush
}
