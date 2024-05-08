const mongoose = require("../../common/database")();


const categoryBinSchema = new mongoose.Schema({
    description: {
        type: String,
        default: "",
    },
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },

},{
        timestamps: true,
});

const categoryBinModel = mongoose.model("CategoriesBin",categoryBinSchema,"categoriesBin");
module.exports = categoryBinModel;