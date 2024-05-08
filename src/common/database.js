const mongoose = require("mongoose");
const config = require("config")
module.exports = () => {
    mongoose.connect(config.get("db.mongoDB.uri")).then(() => console.log("Connecting to DB!"));
    return mongoose
}