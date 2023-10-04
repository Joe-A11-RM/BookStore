const mongoose = require('mongoose')
const emailvalidator = require('email-validator')
const { passwordStrength } = require('check-password-strength')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Admin = mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    AccessCode: {
        type: String,
    },
    Email: {
        type: String,
        required: true,
        unique: true,
    },
    Password: {
        type: String,
        required: true,
    },
    Tokens: {
        type: String
    },
    Role: {
        type: String,
        default: "Admin"
    }
}, { timestamps: true })
Admin.pre("save", async function(next) {
    if (passwordStrength(this.Password).value == "Strong") {
        if (this.isModified('Password')) {
            this.Password = await bcrypt.hash(this.Password, 8)
        }
    } else {
        throw new Error("Please Enter Strong Password")
    }

    if (emailvalidator.validate(this.Email) == false) {
        throw new Error("Email Format Is Wrong")
    }
    next()
})
Admin.methods.generateToken = async function() {
    const newtoken = jwt.sign({ id: this._id }, "random")
    this.Tokens = this.Tokens.concat({ Token: newtoken })
    return newtoken
}
module.exports = mongoose.model("Admin", Admin)