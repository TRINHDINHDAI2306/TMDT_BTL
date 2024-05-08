const mongoose = require("../../common/database")();

const userBinSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        default: "Member",
    },
    full_name: {
        type: String,
        required: true,
    },
    provider : {
        type : String,
        default : "email"
    },
    socialId: {
        type: String,
        default: null,
      },

},{
        timestamps: true,
});

const userBinModel = mongoose.model("UsersBin",userBinSchema,"usersBin");
module.exports = userBinModel;