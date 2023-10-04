const mongoose = require('mongoose')
const database = "Bookstore"
const server = '127.0.0.1:27017'
class Database {
    connect() {
        mongoose.connect(`mongodb://${server}/${database}`, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                console.log("Database Running Successfully")
            }).catch((err) => {
                console.log("Database connection failed")
            })
    }
}
module.exports = new Database()