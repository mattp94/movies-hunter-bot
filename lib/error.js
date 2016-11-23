// *** Libraries ***

var makeError = require('make-error')



// *** Error ***

var LoggedError = makeError('LoggedError')



// *** Exports ***

module.exports = {
    LoggedError: LoggedError
}
