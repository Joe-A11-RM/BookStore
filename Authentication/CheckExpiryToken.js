const UserModel = require("../Models/User")
const { createToken, expirationtime } = require("../Controller/Tokens")
const ConvertToSec = require("../Helpers/Date")

let userToken = async(req, res, next) => {
    const user = await UserModel.findOne({
        Email: req.body.Email
    })
    let TokenTime = ConvertToSec(user._id.getTimestamp())
    if (Math.round(Date.now() / 1000) >= (TokenTime + expirationtime)) {
        console.log("Token Expired")
        user.Tokens = ""
        user.save()
            //res.send("Please Login")
        next()
    } else {
        console.log("Token not expired")
        console.log(user.Tokens)
        res.send("Already Logged in  " + user.Tokens)
    }

}
module.exports = userToken