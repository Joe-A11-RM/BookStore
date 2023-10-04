const jwt = require("jsonwebtoken")
const verfiytoken = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, "Hasta el final", (err, decodedToken) => {
            if (err) {
                console.log(err.message)
                res.send("Please Login")
            } else {
                console.log(decodedToken)
                next()
            }
        })
    } else {
        res.send("Please Login")
    }
}
module.exports = { verfiytoken }