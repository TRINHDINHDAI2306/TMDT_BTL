const mongoose = require("../../common/database")();

const oderSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Customers',
        required: true
      },
    full_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    total_price: {
        type: Number,
        default: 0,
    },
    items: [{
        prd_id: {
            type: mongoose.Types.ObjectId,
            ref: "Products",
            required: true
        },
        qty: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        name : {
            type : String,
            required: true,
        }
    }],
    confirmed: {
        type: Boolean,
        default: false
      },


},{timestamps: true})

const oderModel = mongoose.model("Orders", oderSchema, "orders")
module.exports = oderModel;