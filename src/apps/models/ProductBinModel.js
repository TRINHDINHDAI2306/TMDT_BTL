const mongoose = require("../../common/database")();


const productBinSchema = new mongoose.Schema({
    thumbnails: [String],
    description: {
        type: String,
        default: "",
    },
    price: {
        type: Number,
        default: 0,
    },
    cat_id: {
        type: mongoose.Types.ObjectId,
        ref: "Categories",
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        default: "",
    },
    featured: {
        type: Boolean,
        default: false,
    },
    promotion: {
        type: String,
        default: "",
    },
    warranty: {
        type: String,
        required: true,
    },
    accessories: {
        type: String,
        default: "",
    },
    promotion: {
        type: String,
        default: "",
    },
    is_stock: {
        type: Boolean,
        default: true,
    },
    name: {
        type: String,
        required: true,
        text : true
    },
    slug: {
        type: String,
        required: true,
    },


},{
        timestamps: true,
});

const productBinModel = mongoose.model("ProductsBin",productBinSchema,"productsBin");
module.exports = productBinModel;