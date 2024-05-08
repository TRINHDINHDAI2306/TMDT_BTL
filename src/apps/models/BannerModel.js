const mongoose = require("../../common/database")();

const bannerschema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    image : {
        type : String,
        required : true
    },
    status : {
        type : Boolean,
        default : false
    },
    urlBanner : {
        type : String,
        default : ""
    }
},{timestamps : true})

const BannerModel = mongoose.model("Banners", bannerschema, "banners")
module.exports = BannerModel;