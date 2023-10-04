const mongoose = require("mongoose")
const emailvalidator = require("email-validator")
const { passwordStrength } = require("check-password-strength")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieparser = require("cookie-parser")
const User = mongoose.Schema({
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },

    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    Tokens: {
        type: String
    },
    PinCode: {
        type: Number
    }
}, { timestamps: true })
User.pre("save", async function(next) {
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

module.exports = mongoose.model("User", User)