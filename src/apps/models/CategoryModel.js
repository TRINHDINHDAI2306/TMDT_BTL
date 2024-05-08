const mongoose = require("../../common/database")();


const categorySchema = new mongoose.Schema({
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
    parent_id:{
        type : String,
        default : "",
    }
},{
        timestamps: true,
});

const categoryModel = mongoose.model("Categories",categorySchema,"categories");
module.exports = categoryModel;