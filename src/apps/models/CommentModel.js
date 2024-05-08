const mongoose = require("../../common/database")();


const commentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    prd_id: {
        type: mongoose.Types.ObjectId,
        ref: "Products",
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    full_name: {
        type: String,
        required: true,
    },
    status: {
        type :Boolean,
        default: false
    }
},{
        timestamps: true,
});

const commentModel = mongoose.model("Comments",commentSchema,"comments");
module.exports = commentModel;