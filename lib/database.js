// *** Libraries ***

var config = require('./config.js')

var fs = require ('fs')
var _ = require('lodash')



// *** Database ***

var data = {
    current: JSON.parse(fs.readFileSync(config.locations.movies, 'utf8')), // Read movies.json
    new: {movies: []}
}

var getMovieFromInode = function (which, inode) {
    return _.chain(data[which].movies).find({inode: inode}).get('data').value() // return undefined if not exist
}

var getMovieFromSearch = function (which, search) {
    return _.chain(data[which].movies).find(function (movie) { // return undefined if not exist
        return _.findIndex(movie.locations, {search: search}) !== -1 ? true : false
    }).get('data').value()
}

var getMovieFromCode = function (which, code) {
    return _.chain(data[which].movies).find({data: {code: code}}).get('data').value() // return undefined if not exist
}

var insertMovie = function (movie) {
    data.new.movies.push(movie)
}

var updateMovie = function (movie, folder) {
    movie.locations.push(folder)
}

var save = function () {
    fs.writeFileSync(config.locations.movies, JSON.parse(data.new)) // Erase movies.json
}



// *** Exports ***

module.exports = {
    getMovieFromId: getMovieFromId,
    getMovieFromSearch: getMovieFromSearch,
    getMovieFromCode: getMovieFromCode,
    insertMovie: insertMovie,
    updateMovie: updateMovie,
    save: save
}
