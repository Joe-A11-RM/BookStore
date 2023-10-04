const mongoose = require("mongoose")
const Payment = mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        reuired: true
    },
    PaymentDetails: [{
        PaymentDate: {
            type: Date,
            required: true
        },
        CartSerial: {
            type: String,
            required: true
        },
        Book: [{
            type: String,
            required: true,
            ref: "Book"
        }],
        TotalPrice: {
            type: Number,
            required: true
        }
    }]
}, { timestamps: true })
module.exports = mongoose.model("Payment", Payment)