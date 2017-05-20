// *** Imports ***

const chalk = require('chalk')
const moment = require('moment')

const bot = require('./lib/bot')
const utility = require('./lib/utility')

const { version, author: { name } } = require('./package.json')



// *** Main ***

const date = new Date()

console.log(chalk.gray(`Movies-Hunter Bot v${version} by ${name}`))
console.log(chalk.gray('Launched on ') + moment(date).format('dddd, MMMM Do YYYY') + chalk.gray(' at ') + moment(date).format('HH:mm:ss'))
console.log(chalk.gray('---'))

bot().catch(err => {
    console.log(err)
})
