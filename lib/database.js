// *** Libraries ***

var config = require('./config.js')

var fs = require ('fs')
var lowdb = require('lowdb')



// *** Database ***

var db = lowdb(config.locations.db)
db.defaults({movies: [], tmp: []}).value()

var findFromInode = function (table, inode) {
    var movies = db.get(table).filter(function (movie) {
        return db._.findIndex(movie.locations, {inode: inode}) !== -1 ? true : false
    }).value()

    return movies.length === 0 ? undefined : movies // return undefined if not exist
}

var findFromSearch = function (table, search) {
    var movies = db.get(table).filter(function (movie) {
        return db._.findIndex(movie.locations, {search: search}) !== -1 ? true : false
    }).value()

    return movies.length === 0 ? undefined : movies
}

var findFromCode = function (table, code) {
    var movies = db.get(table).filter({data: {code: code}}).value()

    return movies.length === 0 ? undefined : movies
}

var insert = function (movie) { // Insert a movie with data
    db.get('tmp').push(movie).value()
}

var update = function (duplicate, movie) { // Insert a movie without data (folder) in a duplicate
    db.get('tmp').find(duplicate).get('locations').push(movie.locations[0]).value()
}

var tmpToMovies = function () {
    db.set('movies', db.get('tmp').value()).value() // Replace movies by tmp
    db.set('tmp', []).value() // Reset tmp
}



// *** Exports ***

module.exports = {
    findFromInode: findFromInode,
    findFromSearch: findFromSearch,
    findFromCode: findFromCode,
    insert: insert,
    update: update,
    tmpToMovies: tmpToMovies
}
