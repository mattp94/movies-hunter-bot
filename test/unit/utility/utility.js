// *** Libraries ***

var utility = require('./../../../lib/utility')

var chai = require('chai')
var path = require('path')
var fs = require('fs')
var mime = require('mime')
var child = require('child_process')



// *** Utility ***

describe('Utility', function () {

    // ** getAbsolutePath **

    describe('getAbsolutePath(filename)', function () {

        it('should return the same path for an absolute path', function () {
            var absolutePath = '/a/b/c'
            chai.expect(utility.getAbsolutePath(absolutePath)).to.equal(absolutePath)
        })

        it('should return an absolute path for a relative path', function () {
            var relativePath = 'a/b/c'
            chai.expect(utility.getAbsolutePath(relativePath)).to.equal(path.dirname(require.main.filename) + '/' + relativePath)
        })

    })

    // ** thumbnailer **

    describe('thumbnailer(source, destination, width, height)', function () {

        var source = __dirname + '/ressources/poster.jpg'
        var destination = __dirname + '/ressources/thumbnail.jpg'
        var width = 170
        var height = 227

        utility.thumbnailer(source, destination, width, height)

        it('should create a jpeg file with the new dimensions', function () {
            chai.expect(fs.statSync(destination).isFile()).to.be.true
            chai.expect(mime.lookup(destination)).to.equal('image/jpeg')
            chai.expect(child.execFileSync('identify', ['-format', '%[fx:w]x%[fx:h]', destination], {encoding: 'utf8'})).to.equal(width + 'x' + height)
        })

        after(function () {
            fs.unlinkSync(destination)
        })
    })

})
