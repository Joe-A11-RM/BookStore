const nodemailer = require("nodemailer")
const deleteEmail = (FirstName, id) => {
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
        subject: "DELETE ACCOUNT",
        text: `Hello ${FirstName}`,
        html: '<p>Click on <a href="http://localhost:5000/Bookstore/UserRemoveAccount/' + id + '">link </a> to delete your account</p>'
    }

    via.sendMail(options, function(err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log("Email Sent" + info.response)
        }
    })
}
module.exports = deleteEmail