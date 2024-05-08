const ProductBinModel = require("../models/ProductBinModel")
const ProductModel = require("../models/ProductModel")
const UserModel = require("../models/UserModel")
const UserBinModel = require("../models/UserBinModel")
const CategoryModel = require("../models/CategoryModel")
const CategoryBinModel = require("../models/CategoryBinModel")
const RootModel = require("../models/rootModel")
const path = require("path");
const fs = require("fs")


const products = async (req, res) => {
    const count = 1;
    const productsBin = await ProductBinModel
        .find()
        .populate({ path: "cat_id" })
        .sort({ _id: -1 });
    res.render("admin/recycle_bin/products_bin", {
        count,
        productsBin,
    })
}
const moveProducts = async (req, res) => {
    const { productIds } = req.body;
    const productsMove = await ProductBinModel.find({ _id: productIds })
    if (productsMove.length > 0) {
        const moveProducts = [];
        productsMove?.map(product => {
            const productData = product.toObject();
            const thumbnails = productData.thumbnails;
            for (const thumbnail of thumbnails) {
                const oldImagePath = path.join(__dirname, "../../public/Uploads/images", thumbnail);
                const newImagePath = path.join(__dirname, "../../public/Uploads/images/products", path.basename(thumbnail));
                fs.renameSync(oldImagePath, newImagePath);
            }
            const newThumbnails = thumbnails.map(thumbnail => `products/${path.basename(thumbnail)}`);

            const moveProduct = {
                ...product.toObject(),
                move_to_product: true,
                thumbnails: newThumbnails
            }
            moveProducts.push(moveProduct);
        })
        await ProductModel.insertMany(moveProducts)
        await ProductBinModel.deleteMany({ _id: { $in: productIds }, move_to_product: true })

    }
    return res.redirect("/admin/recycle_bin/products")
}

const delAllProducts = async (req, res) => {
    const { checkedIds } = req.body;
    await ProductBinModel.deleteMany({ _id: { $in: checkedIds } })
    return res.redirect("/admin/recycle_bin/products")
}

const categories = async (req, res) => {
    const count = 1;
    const CategoriesBin = await CategoryBinModel
        .find()
        .sort({ _id: -1 });
    res.render("admin/recycle_bin/categories_bin", {
        count,
        CategoriesBin,
    })
}

const moveCategories = async (req, res) => {
    const { categoryIds } = req.body;
    const categoriesMove = await CategoryBinModel.find({ _id: categoryIds })
    if (categoriesMove.length > 0) {
        const moveCategories = [];
        categoriesMove?.map(category => {
            const moveCategory = {
                ...category.toObject(),
                move_to_category: true
            }
            moveCategories.push(moveCategory)
        })
        await CategoryModel.insertMany(moveCategories);
        await CategoryBinModel.deleteMany({ _id: { $in: categoryIds }, move_to_category: true })

        const productsMove = await ProductBinModel.find({ cat_id: {$in:categoryIds } })
        if (productsMove.length > 0) {
            const moveProducts = [];
            productsMove?.map(product => {
                const productData = product.toObject();
                const thumbnails = productData.thumbnails;
                for (const thumbnail of thumbnails) {
                    const oldImagePath = path.join(__dirname, "../../public/Uploads/images", thumbnail);
                    const newImagePath = path.join(__dirname, "../../public/Uploads/images/products", path.basename(thumbnail));
                    fs.renameSync(oldImagePath, newImagePath);
                }
                const newThumbnails = thumbnails.map(thumbnail => `products/${path.basename(thumbnail)}`);
    
                const moveProduct = {
                    ...product.toObject(),
                    move_to_product: true,
                    thumbnails: newThumbnails
                }
                moveProducts.push(moveProduct);
            })
            await ProductModel.insertMany(moveProducts)
            await ProductBinModel.deleteMany({ cat_id: { $in: categoryIds }, move_to_product: true })
    
        }


    }
    return res.redirect("/admin/recycle_bin/categories")
}
const delAllCategories = async (req, res) => {
    const { checkedIds } = req.body;
    await CategoryBinModel.deleteMany({ _id: { $in: checkedIds } });
    const productsToMove = await ProductBinModel.find({ cat_id: { $in: checkedIds } });
    if (productsToMove.length > 0) {
        const updateProducts = [];
        productsToMove?.map(product => {
            const thumbnails = product.thumbnails;
            for (const thumbnail of thumbnails) {
                const oldImagePath = path.join(__dirname, "../../public/Uploads/images", thumbnail);
                const newImagePath = path.join(__dirname, "../../public/Uploads/images/roots", path.basename(thumbnail));
                fs.renameSync(oldImagePath, newImagePath);
            }
            const newThumbnails = thumbnails.map(thumbnail => `roots/${path.basename(thumbnail)}`);

            const updateProduct = {
                ...product.toObject(),
                move_to_prdBin: true,
                thumbnails: newThumbnails
            };
            updateProducts.push(updateProduct)
        })
        await RootModel.insertMany(updateProducts)
        await ProductBinModel.deleteMany({ cat_id: { $in: checkedIds }, move_to_root: true }) // xóa tất cả sản phẩm có cat_id = id và gắn true;
    }

    return res.redirect("/admin/recycle_bin/categories")
}



const users = async (req, res) => {
    const count = 1;
    const usersBin = await UserBinModel.find()
    res.render("admin/recycle_bin/users_bin", {
        count,
        usersBin,
    })
}

const moveUsers = async (req, res) => {
    const { userIds } = req.body;
    const usersMove = await UserBinModel.find({ _id: userIds });
    if (usersMove.length > 0) {
        const moveUsers = [];
        usersMove?.map(user => {
            const moveUser = {
                ...user.toObject(),
                move_to_user: true
            }
            moveUsers.push(moveUser)
        })
        await UserModel.insertMany(moveUsers);
        await UserBinModel.deleteMany({ _id: { $in: userIds }, move_to_user: true })
    }
    return res.redirect("/admin/recycle_bin/users")
}

const delAllUsers = async (req, res) => {
    const { checkedIds } = req.body;
    await UserBinModel.deleteMany({ _id: { $in: checkedIds } })
    return res.redirect("/admin/recycle_bin/users")
}

module.exports = {
    products,
    moveProducts,
    delAllProducts,
    categories,
    moveCategories,
    delAllCategories,
    users,
    moveUsers,
    delAllUsers
}