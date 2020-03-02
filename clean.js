// *** Imports ***

const database = require('./lib/database')



// *** Clean ***

const main = async () => {
    const db = await database.init()

    await db.get('movies')
            .remove(movie => !movie.data)
            .write()
}

main().catch(console.error)
