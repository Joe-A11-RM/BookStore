const bcrypt = require('bcrypt')
const randomString = require('randomstring')
const Adminmodel = require('../Models/Admin')
const BookModel = require('../Models/Books')
const { createToken, expirationtime } = require("../Controller/Tokens")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const express = require("express")
const app = express()
app.use(cookieParser())
class Admin {
    static AddAdmin = async(req, res) => {
        try {
            const add = await new Adminmodel({
                Name: req.body.Name,
                Email: req.body.Email,
                Password: req.body.Password
            })
            add.AccessCode = randomString.generate(7)
            await add.save()
            res.send(add)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static EditAdmin = async(req, res) => {
        try {
            const edit = await Adminmodel.findOneAndUpdate({
                _id: req.params.id
            }, req.body)
            await edit.save()
            res.send(edit)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static DeleteAdmin = async(req, res) => {
        try {
            const remove = await Adminmodel.findOneAndDelete({
                _id: req.params.id
            })
            await remove.save()
            res.send(remove)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static Login = async(req, res) => {
        try {
            const login = await Adminmodel.findOne({
                AccessCode: req.body.AccessCode,
            })
            if (login) {
                const isPassword = bcrypt.compare(req.body.Password, login.Password)
                if (isPassword) {
                    //login.generateToken()
                    login.Tokens = createToken(login._id)
                    res.cookie('jwt', login.Tokens, { httpOnly: true })
                    await login.save()
                    res.send(login)
                }
            } else {
                throw new Error("Access code or Password is invalid")
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static Logout = async(req, res) => {
        try {
            const admintoken = req.header("cookie").replace("jwt=", "")
            const token = jwt.verify(admintoken, "Hasta el final")
            const logout = await Adminmodel.findOne({
                _id: token.id
            })
            if (logout) {
                logout.Tokens = ""
                res.cookie('jwt', '', { maxAge: 1 })
                res.send(logout)
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static AddBook = async(req, res) => {
        try {
            const add = await new BookModel(req.body)
            await add.save()
            res.send(add)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static FindBook = async(req, res) => {
        try {
            const book = await BookModel.find(req.body)
            if (book) {
                res.send(book)
            } else {
                res.send("Can't find this book")
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static UpdateBook = async(req, res) => {
        try {
            const edit = await BookModel.findByIdAndUpdate({
                _id: req.params.id
            }, req.body)
            await edit.save()
            res.send(edit)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static DeleteBook = async(req, res) => {
        try {
            const remove = await BookModel.findOneAndDelete({ _id: req.params.id })
            res.send("Book is deleted")
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
}
module.exports = Admin