// *** Libraries ***

var makeError = require('make-error')



// *** Error ***

var LoggedError = makeError('LoggedError') // Error not throwable but logged



// *** Exports ***

module.exports = {
    LoggedError: LoggedError
}
