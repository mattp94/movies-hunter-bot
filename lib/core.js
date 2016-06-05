// *** Libraries ***

var extractor = require('./extractor.js')
var database = require('./database.js')



// *** Core ***

var job = function (folder) {
    var movie

    // >> Duplicate from SEARCH <<
    if (movie = database.getMovieFromSearch('new', folder.search)) {
        database.updateMovie(movie, folder)
        return [true, 'update', 'search']
    }

    // >> Find from SEARCH <<
    if (movie = database.getMovieFromSearch('current', folder.search)) {
        database.insertMovie('new', {locations: [folder], data: movie.data})
        return [true, 'insert', 'search']
    }

    var codes = extractor.allocine.getCodes(folder.search)

    if (codes.length > 0) { // At least one code
        var code = codes[0]

        // >> Duplicate from CODE <<
        if (movie = database.getMovieFromCode('new', code)) {
            database.updateMovie(movie, folder)
            return [true, 'update', 'code']
        }

        // >> Find from CODE <<
        if (movie = database.getMovieFromCode('current', code)) {
            database.insertMovie('new', {locations: [folder], data: movie.data})
            return [true, 'insert', 'code/allocine']
        }

        var data = extractor.allocine.getData(codes[0]) // Extract Allociné data from code

        // >> Find from EXTERNAL <<
        if (data) {
            database.insertMovie('new', {locations: [folder], data: data})
            return [true, 'insert', 'external/allocine']
        }
    }

    return [false]
}

var done = function () {
    database.save()
}



// *** Exports ***

module.exports = {
    job: job,
    done: done
}
