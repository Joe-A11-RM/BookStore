const jwt = require("jsonwebtoken")
const expirationtime = 1 * 24 * 60 * 60
const createToken = (id) => {
    return jwt.sign({ id }, "Hasta el final", {
        expiresIn: expirationtime
    })
}
module.exports = { createToken, expirationtime }