const nodemailer = require("nodemailer")
    //let PinCode = Math.floor(Math.random() * 1000001)
const sendEmail = (FirstName, Token) => {
    var via = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "yousefcr72001@gmail.com",
            pass: "ciangguduivgbtzw"
        }
    })

    var options = {
        from: "yousefcr72001@gmail.com",
        to: "yousefsherif7500@gmail.com",
        subject: "Password Change Code",
        text: `Hello ${FirstName}`,
        html: '<p>Please copy the link <a href="http://localhost:5000/Bookstore/UserResetPassword?token=' + Token + '"> and reset password</a> </p >'
    }

    via.sendMail(options, function(err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log("Email Sent" + info.response)
        }
    })
}


module.exports = sendEmail