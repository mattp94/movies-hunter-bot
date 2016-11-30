// *** Libraries ***

const makeError = require('make-error')



// *** Error ***

const LoggedError = makeError('LoggedError') // Error not throwable but logged



// *** Exports ***

module.exports = {
    LoggedError
}
