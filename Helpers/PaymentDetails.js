const PaymentModel = require('../Models/Payment')
const CartModel = require('../Models/Cart')
let StorePaymentDetails = async(userid, totalprice, bookname) => {
    let getcart = await CartModel.findOne({ UserId: userid })
    let userpayment = await PaymentModel.findOne({ UserId: userid })
    if (userpayment == null) {
        userpayment = await new PaymentModel({
            UserId: userid,
            PaymentDetails: [{
                PaymentDate: Date.now(),
                CartSerial: getcart.CartSerial,
                Book: bookname,
                TotalPrice: totalprice
            }]
        })
        await userpayment.save()
    } else {
        for (let x of userpayment.PaymentDetails) {
            if (getcart.CartSerial != x.CartSerial) {
                await userpayment.PaymentDetails.push({
                    PaymentDate: Date.now(),
                    CartSerial: getcart.CartSerial,
                    Book: bookname,
                    TotalPrice: totalprice
                })
                await userpayment.save()
                return
            }
        }
    }
}
module.exports = StorePaymentDetails