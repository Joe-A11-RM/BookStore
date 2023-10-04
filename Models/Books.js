const mongoose = require("mongoose")
const Book = mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    Author: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    Count: {
        type: Number,
        required: true
    },
    Status: {
        type: String,
        enum: ["In Stock", "Out Of Stock"],
        default: "In Stock"
    }
}, { timestamps: true })
module.exports = mongoose.model("Book", Book)