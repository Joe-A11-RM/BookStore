const mongoose = require("mongoose")
const Cart = mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        reuired: true
    },
    Books: [{
        BookID: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Book"
        }
    }],
    TotalPrice: {
        type: Number,
        reuired: true
    },
    CartSerial: {
        type: String,
        required: true
    }
}, { timestamps: true })
module.exports = mongoose.model("Cart", Cart)