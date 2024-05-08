
const RootModel = require("../models/rootModel");
const CategoryModel = require("../models/CategoryModel");
const ProductModel = require("../models/ProductModel");
const CommentModel = require("../models/CommentModel")
const path = require("path");
const fs = require("fs")




const index = async (req, res) => {
    const count = 1;

    const roots = await RootModel.find();
    const categories = await CategoryModel.find()
    res.render("admin/roots/roots", {
        roots,
        count,
        categories,
    })
};

const moveProducts = async (req, res) => {
    const { productIds, categoryId } = req.body;
    const productsMove = await RootModel.find({ _id: productIds })

    if (productsMove.length > 0) {
        const moveProducts = [];
        productsMove?.map(product => {
            const thumbnails = product.thumbnails;
            for (const thumbnail of thumbnails) {
                const oldImagePath = path.join(__dirname, "../../public/Uploads/images", thumbnail);
                const newImagePath = path.join(__dirname, "../../public/Uploads/images/products", path.basename(thumbnail));
                fs.renameSync(oldImagePath, newImagePath);
            }
            const newThumbnails = thumbnails.map(thumbnail => `products/${path.basename(thumbnail)}`);

            const moveProduct = {
                ...product.toObject(),
                move_to_prdBin: true,
                cat_id: categoryId,
                thumbnails: newThumbnails
            }
            moveProducts.push(moveProduct)
        })
        await ProductModel.insertMany(moveProducts)
        await RootModel.deleteMany({ _id: { $in: productIds } })

    }
    return res.redirect("/admin/roots")
}

const delAll = async (req, res) => {
    const { checkedIds } = req.body;
    await RootModel.deleteMany({ _id: { $in: checkedIds } });
    await CommentModel.deleteMany({prd_id : {$in: checkedIds}});

    return res.redirect("/admin/roots");
}

module.exports = {
    index,
    moveProducts,
    delAll,
}