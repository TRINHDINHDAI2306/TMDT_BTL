const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/CategoryModel");
const ProductBinModel = require("../models/ProductBinModel");
const UserModel = require("../models/UserModel");
const pagination = require("../../common/pagination");
const filterForm = require("../../common/filterForm");
const slug = require("slug");
const fs = require("fs");
const path = require("path");
const { isValidImageExtension } = require("../../libs/ValidImageExtension");
const vndPrice = require("../../libs/vndPrice");

const index = async (req, res) => {
  try {
    const filterFormData = filterForm(req.query);
    let find = { deleted: false };

    // Apply form filters
    if (filterFormData.find) {
      find = { ...find, ...filterFormData.find };
    }
    const sort = { ...filterFormData.sort, _id: -1 };

    // Total products count
    const find_total_products = await ProductModel.countDocuments(find);

    const multiData = [
      { title: "Còn Hàng", value: true },
      { title: "Hết Hàng", value: false },
      { title: "Xóa sản phẩm", value: "deleted" },
    ];

    // Menu da cấp
    const multipleCategories = await CategoryModel.find({});
    const createTree = (data, parentId = "") => {
      const tree = [];
      data.forEach((item) => {
        if (item.parent_id == parentId) {
          const newItem = item;
          const children = createTree(data, item.id);
          if (children.length > 0) {
            newItem.children = children;
          }
          tree.push(newItem);
        }
      });
      return tree;
    };
    const newCategories = createTree(multipleCategories);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = page * limit - limit;
    let count = 1;

    const products = await ProductModel.find(find)
      .populate({ path: "cat_id" })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(find_total_products / limit);
    const user = await UserModel.findOne({ email: req.session.email });
    const role = user?.role;
    res.render("admin/products/product", {
      products,
      categories: newCategories,
      pages: pagination(page, limit, find_total_products),
      page,
      totalPages,
      count,
      find,
      filterFormData,
      find_total_products,
      multiData,
      role,
      vndPrice,
    });
  } catch (error) {
    console.error("Error in index controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

const create = async (req, res) => {
  const categories = await CategoryModel.find().sort({ _id: -1 });
  res.render("admin/products/add_product", {
    categories,
    data: {},
  });
};

const store = async (req, res) => {
  try {
    let error = "";
    const { body, files } = req;
    const thumbnails = [];
    const product = {
      name: body.name,
      price: body.price,
      warranty: body.warranty,
      accessories: body.accessories,
      promotion: body.promotion,
      status: body.status,
      cat_id: body.cat_id,
      featured: body.featured == "on",
      description: body.description,
      slug: slug(body.name),
      is_stock: body.storehouse > 0,
      storehouse: body.storehouse,
      thumbnails: thumbnails,
    };

    const categories = await CategoryModel.find().sort({ _id: -1 });

    // Validate image extensions
    for (let file of files) {
      if (!isValidImageExtension(file.originalname)) {
        error = "Ảnh không đúng định dạng (.jpg, .jpeg, .png, .webp)";
        return res.render("admin/products/add_product", {
          categories,
          data: { error },
        });
      }
    }

    if (files) {
      files.forEach((file) => {
        const uniqueSuffix = Date.now();
        const thumbnail = `products/${uniqueSuffix + "-" + file.originalname}`;
        fs.renameSync(
          file.path,
          path.resolve("src/public/Uploads/images", thumbnail)
        );
        thumbnails.push(thumbnail);
      });

      await new ProductModel(product)
        .save()
        .then(() => {
          console.log("Product saved successfully.");
          return res.redirect("/admin/products");
        })
        .catch((err) => {
          console.error("Error saving product:", err);
          return res.status(500).send("Error saving product");
        });
    } else {
      console.log("No images uploaded. Product not saved.");
      return res.redirect("/admin/products");
    }
  } catch (error) {
    console.error("Error in store controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await CategoryModel.find();
    const product = await ProductModel.findById(id);
    res.render("admin/products/edit_product", {
      product,
      categories,
      data: {},
    });
  } catch (error) {
    console.error("Error in edit controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

const update = async (req, res) => {
  try {
    const { body, files } = req;
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    let error = "";
    const thumbnails = product.thumbnails.slice(); // giữ lại các hình ảnh hiện có
    const updatedProduct = {
      name: body.name,
      price: body.price,
      warranty: body.warranty,
      accessories: body.accessories,
      promotion: body.promotion,
      status: body.status,
      cat_id: body.cat_id,
      featured: body.featured == "on",
      description: body.description,
      storehouse: body.storehouse,
      is_stock: body.storehouse > 0,
      slug: slug(body.name),
      thumbnails: thumbnails,
    };

    const categories = await CategoryModel.find().sort({ _id: -1 });

    // Validate image extensions
    for (let file of files) {
      if (!isValidImageExtension(file.originalname)) {
        error = "Ảnh không đúng định dạng (.jpg, .jpeg, .png, .webp)";
        return res.render("admin/products/edit_product", {
          categories,
          data: { error },
          product,
        });
      }
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        const uniqueSuffix = Date.now();
        const thumbnail = `products/${uniqueSuffix + "-" + file.originalname}`;
        console.log(file.originalname);
        fs.renameSync(
          file.path,
          path.resolve("src/public/Uploads/images", thumbnail)
        );
        thumbnails.push(thumbnail);
      });
    }

    await ProductModel.updateOne({ _id: id }, { $set: updatedProduct });
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error in update controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

const del = async (req, res) => {
  try {
    const { id } = req.params;
    await ProductModel.deleteOne({ _id: id });
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error in delete controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

const delSelected = async (req, res) => {
  try {
    const ids = req.body.selectedProducts;
    const productsToDelete = await ProductModel.find({ _id: { $in: ids } });
    const defautImage = [
      "products/Vivo-Y69-Gold.png",
      "products/iPhone-7-Plus-32GB-Rose-Gold.png",
      "products/iPhone-X-256GB-Silver-Seedstock.png",
      "products/iPhone-Xr-2-Sim-64GB-Yellow.png",
      "products/iPhone-Xr-2-Sim-256GB-Red.png",
      "products/iPhone-Xs-256GB-Gold.png",
      "products/Nokia-1-red.png",
      "products/Nokia-3.1-Black.png",
      "products/Nokia-6.1-Plus-Blue.png",
      "products/Nokia-150-White.png",
      "products/OPPO-A3s–16GB-Red.png",
      "products/OPPO-A7-64GB-Blue.png",
      "products/OPPO-F7-128GB-Black.png",
      "products/OPPO-F9-Sunrise-Red.png",
      "products/OPPO-R17-Pro-Lavender.png",
      "products/product-5.png",
      "products/R.png",
      "products/Samsung-Galaxy-A9-2018-Black.png",
      "products/Samsung-Galaxy-J2-Core-Gold.png",
      "products/Samsung-Galaxy-J4-Core-Black.png",
      "products/Samsung-Galaxy-S9-Plus-64GB-Orchid-Gray.png",
      "products/Samsung-Galaxy-S9-Plus-Black-128GB.png",
      "products/Vivo-V7-Gold.png",
      "products/Vivo-V9-Gold.png",
      "products/Vivo-Y53C-Gold.png",
      "products/Vivo-Y69-Gold.png",
      "products/Vivo-Y81i-Red.png",
      "products/Xiaomi-Mi-8-Pro-Black.png",
      "products/Xiaomi-Mi-A1-Black.png",
      "products/Xiaomi-Mi-A1-Gold.png",
      "products/Xiaomi-Mi-Max-3-Ram-4–64GB-Black.png",
      "products/Xiaomi-Redmi-Note-6-Pro–32GB-Blue.png",
    ];
    if (productsToDelete.length > 0) {
      const updateProducts = [];
      productsToDelete.forEach((product) => {
        const thumbnails = product.thumbnails;
        console.log(thumbnails);
        thumbnails.forEach((thumbnail) => {
          const oldImagePath = path.join(
            __dirname,
            "../../public/Uploads/images",
            thumbnail
          );
          const newImagePath = path.join(
            __dirname,
            "../../public/Uploads/images/recycleProducts",
            path.basename(thumbnail)
          );
          if (!defautImage.includes(thumbnail)) {
            fs.renameSync(oldImagePath, newImagePath);
          }
        });
        const newThumbnails = thumbnails.map(
          (thumbnail) => `recycleProducts/${path.basename(thumbnail)}`
        );

        const updatedProduct = {
          ...product.toObject(),
          move_to_prdBin: true,
          thumbnails: newThumbnails,
        };
        updateProducts.push(updatedProduct);
      });
      await ProductBinModel.insertMany(updateProducts);
      await ProductModel.deleteMany({
        _id: { $in: ids },
        move_to_prdBin: true,
      });
    }

    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error in delete selected controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  index,
  create,
  store,
  edit,
  update,
  del,
  delSelected,
};
