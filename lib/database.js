// *** Imports ***

const fs = require('fs-extra')
const lowdb = require('lowdb')
const path = require('path')
const storage = require('lowdb/lib/storages/file-async')

const config = require('./config')
const utility = require('./utility')



// *** Database ***

let db

const init = async () => {
    await fs.ensureFile(utility.abs(config.locations.db))

    db = lowdb(utility.abs(config.locations.db), { storage }) // Load database from json file

    await db.defaults({ movies: [], tmp: [] }) // Set default tables
            .write()
}

const findOneFromInode = (table, inode) => // Find a movie from inode (return undefined if not exists)
    db.get(table)
      .find(movie => db._.findIndex(movie.files, { inode }) !== -1 ? true : false)
      .value()

const findOneFromSearch = (table, search) => // Find a movie from search (return undefined if not exists)
    db.get(table)
      .find(movie => db._.findIndex(movie.files, { search }) !== -1 ? true : false)
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
