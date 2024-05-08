const mongoose = require("../../common/database")();

const userSchema = new mongoose.Schema(
  {
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
    provider: {
      type: String,
      default: "local",
    },
    socialId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("Users", userSchema, "users");
module.exports = userModel;
