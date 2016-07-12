// *** Libraries ***

var extractor = require('./extractor.js')
var database = require('./database.js')



// *** Core ***

var movieHandler = function (folder) {
    var movies

    // Find from INODE >>
    if (movies = database.findFromInode('movies', folder.inode) || database.findFromInode('tmp', folder.inode))
        return {from: 'inode', movie: {locations: [folder], data: movies[0].data}}
    // <<

    // Find from SEARCH >>
    if (movies = database.findFromSearch('movies', folder.search) || database.findFromSearch('tmp', folder.search))
        return {from: 'search', movie: {locations: [folder], data: movies[0].data}}
    // <<

    var codes = extractor.allocine.getCodes(folder.search)

    if (codes.length > 0) { // At least one code
        var code = codes[0]

        // Find from CODE >>
        if (movies = database.findFromCode('movies', code) || database.findFromCode('tmp', code))
            return {from: 'code', movie: {locations: [folder], data: movies[0].data}}
        // <<

        var data = extractor.allocine.getData(codes[0]) // Extract Allociné data from code

        // Find from API >>
        if (data)
            return {from: 'api/allocine', movie: {locations: [folder], data: data}}
        // <<

    }

    return {from: 'nothing', movie: {locations: [folder]}}
}

var duplicateHandler = function (result) {
    var original

    if ('data' in result.movie) {
        if (original = database.findFromCode('tmp', result.movie.data.code))
            result.original = original

        return result
    }

    if (original = database.findFromSearch('tmp', result.movie.locations[0].search))
        result.original = original

    return result
}

var insertionHandler = function (result) {
    if (result.original) {
        database.update(result.original, result.movie)
        console.log('je duplique')
    }
    else {
        database.insert(result.movie)
        console.log('jajoute')
    }
}

var done = function () {
    database.tmpToMovies()
}



// *** Exports ***

module.exports = {
    movieHandler: movieHandler,
    duplicateHandler: duplicateHandler,
    insertionHandler: insertionHandler,
    done: done
}