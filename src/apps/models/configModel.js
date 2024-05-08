const mongoose = require("../../common/database")();

const configsSchema = new mongoose.Schema({
    body : {
        type : String,
        default : ""
    },
    address :
        {
            type : String,
            default : ""
        }
  ,
    service : 
        {
            type : String,
            default : ""
        }
    ,
    hotline : {
        type : String,
        default : ""
    },
    email : {
        type : String,
        default : ""
    },
    register : {
        type : String,
        default : ""
    },
    logo_header: {
        type: String,
        required: true,
    },
    logo_footer: {
        type: String,
        required: true,
    },

})

const configsModel = mongoose.model("Configs",configsSchema,"configs")
module.exports = configsModel;