// *** Libraries ***

var extractor = require('./extractor.js')
var database = require('./database.js')



// *** Core ***

var insertionHandler = function (folder) {
    var movies

    // >> Find from INODE
    if (movies = database.findFromInode('current', folder.inode) || database.findFromInode('new', folder.inode)) {
        database.insert('new', {locations: [folder], data: movies[0].data})
        return {success: true, from: 'inode'}
    }

    // >> Find from SEARCH
    if (movies = database.findFromSearch('current', folder.search) || database.findFromSearch('new', folder.search)) {
        database.insert('new', {locations: [folder], data: movies[0].data})
        return {success: true, from: 'search'}
    }

    var codes = extractor.allocine.getCodes(folder.search)

    if (codes.length > 0) { // At least one code
        var code = codes[0]

        // >> Find from CODE
        if (movies = database.findFromCode('current', code) || database.findFromCode('new', code)) {
            database.insert('new', {locations: [folder], data: movies[0].data})
            return {success: true, from: 'code/allocine'}
        }

        var data = extractor.allocine.getData(codes[0]) // Extract Allociné data from code

        // >> Find from API
        if (data) {
            database.insert('new', {locations: [folder], data: data})
            return {success: true, from: 'api/allocine'}
        }
    }

    return {success: false}
}

var duplicateHandler = function (folder) {

}

var done = function () {
    database.save()
}



// *** Exports ***

module.exports = {
    insertionHandler: insertionHandler,
    done: done
}
