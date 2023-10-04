const AdminModel = require('../Models/Admin')
const jwt = require('jsonwebtoken')
const AdminAuth = async(req, res, next) => {
    try {
        const admintoken = req.header("cookie").replace("jwt=", "")
        const token = jwt.verify(admintoken, "Hasta el final")
        const admin = AdminModel.findById(token.id)
        if (admin.Role != "Admin") {
            throw new Error("Not Admin")
        }
        next()
    } catch (error) {
        res.send({
            apiStatus: false,
            message: error.message
        })
    }
}
module.exports = AdminAuth