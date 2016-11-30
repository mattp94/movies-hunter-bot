// *** Libraries ***

var config = require('./config')
var utility = require('./utility')

var fs = require('fs-plus')
var path = require('path')
var lowdb = require('lowdb')



// *** Database ***

fs.makeTreeSync(path.dirname(utility.absolute(config.locations.db))) // Create directory if not exists

var db = lowdb(utility.absolute(config.locations.db)) // Load database from json file

db.defaults({movies: [], tmp: []}).value() // Set default tables

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

var findOneFromCode = function (table, code, from) { // Find a movie from Code
    return db.get(table).find({data: {code: code, from: from}}).value() // return undefined if not exist
}

var insert = function (movie) { // Insert a movie with data
    db.get('tmp').push(movie).value()
}

var update = function (duplicate, movie) { // Push a movie without data (file) to a duplicate
    db.get('tmp').find(duplicate).get('files').push(movie.files[0]).value()
}

var flush = function () { // flush tmp in movies
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
    flush: flush
}
