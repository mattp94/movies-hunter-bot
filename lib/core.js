// *** Libraries ***

var extractor = require('./extractor.js')
var database = require('./database.js')



// *** Core ***

var movieHandler = function (folder) {
    var movies

    // Find from INODE >>
    if (movies = database.findFromInode('current', folder.inode) || database.findFromInode('new', folder.inode))
        return {from: 'inode', movie: {locations: [folder], data: movies[0].data}}
    // <<

    // Find from SEARCH >>
    if (movies = database.findFromSearch('current', folder.search) || database.findFromSearch('new', folder.search))
        return {from: 'search', movie: {locations: [folder], data: movies[0].data}}
    // <<

    var codes = extractor.allocine.getCodes(folder.search)

    if (codes.length > 0) { // At least one code
        var code = codes[0]

        // Find from CODE >>
        if (movies = database.findFromCode('current', code) || database.findFromCode('new', code))
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

var duplicateHandler = function (movie) {

}

var insertionHandler = function (movie) {
    database.insert('new', movie)
}

var done = function () {
    database.save()
}



// *** Exports ***

module.exports = {
    movieHandler: movieHandler,
    duplicateHandler: duplicateHandler,
    insertionHandler: insertionHandler,
    done: done
}
