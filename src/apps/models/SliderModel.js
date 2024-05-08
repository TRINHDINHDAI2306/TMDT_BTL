const mongoose = require("../../common/database")();

const sliderSchema = new mongoose.Schema({
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
},{timestamps : true})

const SliderModel = mongoose.model("Sliders", sliderSchema, "sliders")
module.exports = SliderModel;