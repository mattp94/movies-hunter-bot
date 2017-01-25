// *** Libraries ***

const createErrorClass = require('create-error-class')



// *** Error ***

const LoggedError = createErrorClass('LoggedError', function (from, message) { // Error not throwable but logged
    this.message = from + (message ? `:${message}` : '')
})



// *** Exports ***

module.exports = {
    LoggedError
}
