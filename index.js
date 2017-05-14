// *** Imports ***

const bot = require('./lib/bot')



// *** Main ***

bot().catch(err => {
    console.log(err)
})
