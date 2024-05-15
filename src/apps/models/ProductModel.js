const mongoose = require("../../common/database")();

const productSchema = new mongoose.Schema(
  {
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
    is_stock: {
      type: Boolean,
    },
    storehouse: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      required: true,
      text: true,
    },
    slug: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to update is_stock based on storehouse value
productSchema.pre("save", async function (next) {
  try {
    if (this.isModified("storehouse")) {
      if (this.storehouse > 0) {
        this.is_stock = true; // Sản phẩm còn hàng
      } else {
        this.is_stock = false; // Sản phẩm hết hàng
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

const productModel = mongoose.model("Products", productSchema, "products");
module.exports = productModel;
