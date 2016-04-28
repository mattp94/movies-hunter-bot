var fs = require('fs')


function Explorer() {

	var browse = function (directories) { // Get folders
		var folders = []

		directories.forEach(function (directory) {
			folders.concat(fs.readdirSync(directory).filter(function (element) {
				if (fs.statSync(directory + '/' + element).isDirectory() && element != '@eaDir') // Only folders different to @eaDir
					return true

				return false
			})
		})

		return folders
	}

}
