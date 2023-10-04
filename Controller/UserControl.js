const UserModel = require("../Models/User")
const BookModel = require("../Models/Books")
const CartModel = require("../Models/Cart")
const PaymentModel = require("../Models/Payment")
const { createToken, expirationtime } = require("../Controller/Tokens")
const sendEmail = require("../Helpers/PasswordUpdate")
const deleteEmail = require("../Helpers/DeleteAccount")
const StorePaymentDetails = require("../Helpers/PaymentDetails")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const express = require("express")
var randomstring = require("randomstring");
const app = express()
app.use(cookieParser())

class User {
    static SignUp = async(req, res) => {
        try {
            const register = await new UserModel(
                req.body
            )
            register.Tokens = createToken(register._id)
            res.cookie('jwt', register.Tokens, { httpOnly: true, maxAge: expirationtime * 1000 })
            console.log(expirationtime)
            await register.save()
            res.send(register)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static UpdateInfo = async(req, res) => {
        try {
            const update = await UserModel.findByIdAndUpdate({
                _id: req.params.id
            }, {
                FirstName: req.body.FirstName,
                LastName: req.body.LastName,
                Email: req.body.Email
            })
            await update.save()
            res.send(update)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static ForgetPassword = async(req, res) => {
        try {
            const useremail = await UserModel.findOne({ Email: req.body.Email })
            if (useremail) {
                res.send("Please Check Your Email")
                sendEmail(useremail.FirstName, useremail.Tokens)
            } else {
                res.send("Can't find this Email")
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static ResetPassword = async(req, res) => {
        try {
            const token = req.query.token
            const tokenData = await UserModel.findOne({ Tokens: token })
            if (tokenData) {
                tokenData.Password = await bcrypt.hash(req.body.Password, 8)
                await tokenData.save()
                res.send(tokenData)
            } else {
                res.send("Can't find this user")
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static DeleteAccRequset = async(req, res) => {
        try {
            const useremail = await UserModel.findOne({
                _id: req.params.id
            })
            if (useremail) {
                res.send("Please Check Your Email")
                deleteEmail(useremail.FirstName, useremail._id)
            } else {
                res.send("Can't find this user")
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static RemoveAcc = async(req, res) => {
        try {
            const removeacc = await UserModel.findByIdAndDelete({ _id: req.params.id })
            const removecart = await CartModel.findOneAndDelete({ UserId: req.params.id })
            const removepayment = await PaymentModel.findOneAndDelete({ UserId: req.params.id })
            res.send("Account Is Deleted")
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static Login = async(req, res) => {
        try {
            const login = await UserModel.findOne({
                Email: req.body.Email
            })
            if (login) {
                const isPassword = bcrypt.compare(login.Password, req.body.Password)
                if (isPassword) {
                    login.Tokens = createToken(login._id)
                    res.cookie('jwt', login.Tokens, { httpOnly: true, maxAge: expirationtime * 1000 })
                    await login.save()
                    res.send(login)
                }
            } else {
                throw new Error("Invalid Email or Password")
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
            const logout = await UserModel.findOne({
                _id: req.params.id
            })
            logout.Tokens = ""
            res.cookie('jwt', '', { maxAge: 1 })
            logout.save()
            res.send(logout)
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static AddToCart = async(req, res) => {
        try {
            const usertoken = req.header("cookie").replace("jwt=", "")
            const token = jwt.verify(usertoken, "Hasta el final")
            const finduser = await CartModel.findOne({ UserId: token.id })
            const findbook = await BookModel.findOne({ _id: req.body.BookID })
            const payments = await PaymentModel.findOne({ UserId: token.id })
            if (finduser == null) {
                if (findbook.Count != 0 && findbook.Status == "In Stock") {
                    const cart = await new CartModel({
                        UserId: token.id,
                        Books: [{
                            BookID: req.body.BookID
                        }]
                    }).populate({ path: "Books.BookID", strictPopulate: false })
                    cart.TotalPrice = findbook.Price
                    cart.CartSerial = randomstring.generate(7)
                    await cart.save()
                    res.send(cart)
                } else {
                    res.send("This Book Is Out Of Stock")
                }
            } else {
                if (findbook.Count != 0 && findbook.Status == "In Stock") {
                    for (let book of finduser.Books) {
                        if (book.BookID.toString() == req.body.BookID) {
                            res.send("You Can't Have More Than One Book From The Same Book")
                            return
                        }
                    }
                    finduser.Books.push({
                        BookID: req.body.BookID
                    })
                    finduser.TotalPrice += findbook.Price
                    await finduser.populate({ path: "Books.BookID", strictPopulate: false })
                    await finduser.save()
                    if (payments) {
                        console.log(payments.PaymentDetails.length)
                        if (payments.PaymentDetails.length >= 2) {
                            finduser.TotalPrice *= 0.5
                            await finduser.save()
                        }
                    }
                    res.send(finduser)
                } else {
                    res.send("This Book Is Out Of Stock")
                }
            }

        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static BuyBooks = async(req, res) => {
        try {
            const usertoken = req.header("cookie").replace("jwt=", "")
            const token = jwt.verify(usertoken, "Hasta el final")
            let finduser = await CartModel.findOne({ UserId: token.id })
            var bookname = []
            if (finduser) {
                for (let book of finduser.Books) {
                    var getbook = await BookModel.findOne({
                        _id: book.BookID.toString()
                    })
                    getbook.Count -= 1
                    if (getbook.Count == 0) {
                        getbook.Status = "Out Of Stock"
                    }
                    bookname.push(getbook.Name)
                    await getbook.save()
                }
                StorePaymentDetails(token.id, finduser.TotalPrice, bookname)
                finduser.Books.splice(0, finduser.Books.length)
                finduser.TotalPrice = 0
                finduser.CartSerial = randomstring.generate(7)
                await finduser.save()
                res.send("Transaction Process Is Done")
            } else {
                res.send("Can't Find This User")
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static ShowCart = async(req, res) => {
        try {
            const usertoken = req.header("cookie").replace("jwt=", "")
            const token = jwt.verify(usertoken, "Hasta el final")
            const show = await CartModel.findOne({ UserId: token.id })
                .populate({ path: "Books.BookID", strictPopulate: false })
            if (show) {
                res.send(show)
            } else {
                res.send("No Cart")
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }

    static DeleteFromCart = async(req, res) => {
        try {
            const usertoken = req.header("cookie").replace("jwt=", "")
            const token = jwt.verify(usertoken, "Hasta el final")
            const getcart = await CartModel.findOne({ UserId: token.id })
            const findbook = await BookModel.findOne({ _id: req.body.BookID })
            if (getcart) {
                getcart.Books.pop({
                    BookID: req.body.ID
                })
                await getcart.populate({ path: "Books.BookID", strictPopulate: false })
                getcart.TotalPrice -= findbook.Price
                await getcart.save()
                res.send(getcart)
            } else {
                res.send("Can't find Cart")
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
    static ShowPayments = async(req, res) => {
        try {
            const usertoken = req.header("cookie").replace("jwt=", "")
            const token = jwt.verify(usertoken, "Hasta el final")
            const userpayments = await PaymentModel.findOne({ UserId: token.id })
            if (userpayments) {
                res.send(userpayments)
            } else {
                res.send("No Payments Found")
            }
        } catch (error) {
            res.send({
                apiStatus: false,
                message: error.message
            })
        }
    }
}

module.exports = User