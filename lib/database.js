// *** Libraries ***

var config = require('./config.js')

var fs = require ('fs')
var lowdb = require('lowdb')



// *** Database ***

var db = lowdb(config.locations.db)

db.defaults({
    movies: [],
    tmp: []
}).value()


var findOneFromInode = function (table, inode) { // Find a movie from Inode
    return db.get(table).find(function (movie) {
        return db._.findIndex(movie.locations, {inode: inode}) !== -1 ? true : false
    }).value() // return undefined if not exist
}

var findOneFromSearch = function (table, search) { // Find a movie from Search
    return db.get(table).find(function (movie) {
        return db._.findIndex(movie.locations, {search: search}) !== -1 ? true : false
    }).value() // return undefined if not exist
}

var findOneFromCode = function (table, code) { // Find a movie from Code
    return db.get(table).find({data: {code: code}}).value() // return undefined if not exist
}

var insert = function (movie) { // Insert a movie with data
    db.get('tmp').push(movie).value()
}

var update = function (duplicate, movie) { // Push a movie without data (folder) to a duplicate
    db.get('tmp').find(duplicate).get('locations').push(movie.locations[0]).value()
}

var tmpToMovies = function () {
    db.set('movies', db.get('tmp').value()).value() // Replace movies by tmp
    db.unset('tmp').value() // Remove tmp
}



// *** Exports ***

module.exports = {
    findOneFromInode: findOneFromInode,
    findOneFromSearch: findOneFromSearch,
    findOneFromCode: findOneFromCode,
    insert: insert,
    update: update,
    tmpToMovies: tmpToMovies
}
