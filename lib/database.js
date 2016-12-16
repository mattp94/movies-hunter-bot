// *** Libraries ***

const config = require('./config')
const utility = require('./utility')

const path = require('path')
const lowdb = require('lowdb')



// *** Database ***

const db = lowdb(utility.absolute(config.locations.db)) // Load database from json file

db.defaults({movies: [], tmp: []}).value() // Set default tables

const findOneFromInode = (table, inode) => db.get(table).find(movie => db._.findIndex(movie.files, {inode}) !== -1 ? true : false).value() // Find a movie from inode (return undefined if not exists)

const findOneFromSearch = (table, search) => db.get(table).find(movie => db._.findIndex(movie.files, {search}) !== -1 ? true : false).value() // Find a movie from search (return undefined if not exists)

const findOneFromCode = (table, code, from) => db.get(table).find({data: {code, from}}).value() // Find a movie from code (return undefined if not exists)

const insert = movie => { // Insert a movie with data
    db.get('tmp').push(movie).value()
}

const update = (duplicate, movie) => { // Push a movie without data (file only) to a duplicate
    db.get('tmp').find(duplicate).get('files').push(movie.files[0]).value()
}

const flush = () => { // flush tmp in movies
    db.set('movies', db.get('tmp').value()).value() // Replace movies by tmp
    db.unset('tmp').value() // Remove tmp
}



// *** Exports ***

module.exports = {
    findOneFromInode,
    findOneFromSearch,
    findOneFromCode,
    insert,
    update,
    flush
}
