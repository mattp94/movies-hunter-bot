// *** Libraries ***

var config = require('./config.js')

var fs = require ('fs')
var lowdb = require('lowdb')



// *** Database ***

var db = lowdb(config.locations.db)

db.defaults({
    movies: [],
    buffer: []
}).value()

var findOneFromInode = function (table, inode) { // Find a movie from Inode
    return db.get(table).find(function (movie) {
        return db._.findIndex(movie.files, {inode: inode}) !== -1 ? true : false
    }).value() // return undefined if not exist
}

var findOneFromSearch = function (table, search) { // Find a movie from Search
    return db.get(table).find(function (movie) {
        return db._.findIndex(movie.files, {search: search}) !== -1 ? true : false
    }).value() // return undefined if not exist
}

var findOneFromCode = function (table, code) { // Find a movie from Code
    return db.get(table).find({data: {code: code}}).value() // return undefined if not exist
}

var insert = function (movie) { // Insert a movie with data
    db.get('buffer').push(movie).value()
}

var update = function (duplicate, movie) { // Push a movie without data (file) to a duplicate
    db.get('buffer').find(duplicate).get('files').push(movie.files[0]).value()
}

var flush = function () { // flush buffer in movies
    db.set('movies', db.get('buffer').value()).value() // Replace movies by buffer
    db.unset('buffer').value() // Remove buffer
}



// *** Exports ***

module.exports = {
    findOneFromInode: findOneFromInode,
    findOneFromSearch: findOneFromSearch,
    findOneFromCode: findOneFromCode,
    insert: insert,
    update: update,
    flush: flush
}
