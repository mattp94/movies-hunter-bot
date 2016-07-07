// *** Libraries ***

var config = require('./config.js')

var fs = require ('fs')
var _ = require('lodash')



// *** Database ***

var data = {
    current: JSON.parse(fs.readFileSync(config.locations.movies, 'utf8')), // Read movies.json
    new: {movies: []}
}

var findFromInode = function (which, inode) {
    var movies = _.chain(data[which].movies).filter(function (movie) {
        return _.findIndex(movie.locations, {inode: inode}) !== -1 ? true : false
    }).value()

    return movies.length === 0 ? undefined : movies // return undefined if not exist
}

var findFromSearch = function (which, search) {
    var movies = _.chain(data[which].movies).filter(function (movie) {
        return _.findIndex(movie.locations, {search: search}) !== -1 ? true : false
    }).value()

    return movies.length === 0 ? undefined : movies // return undefined if not exist
}

var findFromCode = function (which, code) {
    var movies = _.chain(data[which].movies).filter({data: {code: code}}).value()

    return movies.length === 0 ? undefined : movies // return undefined if not exist
}

var insert = function (which, movie) {
    data[which].movies.push(movie)
}

var update = function (movie, folder) {
    movie.locations.push(folder)
}

var save = function () {
    fs.writeFileSync(config.locations.movies, JSON.stringify(data.new)) // Erase movies.json
}



// *** Exports ***

module.exports = {
    findFromInode: findFromInode,
    findFromSearch: findFromSearch,
    findFromCode: findFromCode,
    insert: insert,
    update: update,
    save: save
}
