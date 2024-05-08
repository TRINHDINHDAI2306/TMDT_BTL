const CategoryModel = require("../models/CategoryModel")
const CategoryBinModel = require("../models/CategoryBinModel")
const ProductModel = require("../models/ProductModel");
const pagination = require("../../common/pagination")
const fs = require("fs")
const path = require("path")
const slug = require("slug");
const ProductBinModel = require("../models/ProductBinModel")

const index = async (req, res) => {
    let count = 1;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = page * limit - limit;

    const totalRows = await CategoryModel
        .find()
        .countDocuments();

    const totalPages = Math.ceil(totalRows / limit);
    const categories = await CategoryModel
        .find()
        .populate()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
        const parents = [];
        categories.map(category=>{
        if (category.parent_id && category.parent_id !== "") {
            parents.push(category.parent_id);
        }
    });
    const parentCategories = await CategoryModel.find({_id:{$in:parents }})


    // lấy ra số lượng mỗi danh mục
    
    const productCountPromises =  categories.map(async (category) => {
        const productsCount = await ProductModel.countDocuments({ cat_id: category._id });
        return { ...category.toObject(), productsCount };
    });
    // Chờ tất cả các promise hoàn thành
    const productsWithCounts = await Promise.all(productCountPromises);

    res.render("admin/categories/category", {
        categories : productsWithCounts,
        parentCategories,
        pages: pagination(page, limit, totalRows),
        page,
        totalPages,
        count,
    });
};

const create = async (req, res) => {
    const multipleCategories = await CategoryModel.find({})
    const createTree = (data, parentId = "") => {
        const tree = []
        data.forEach(item => {
            if (item.parent_id == parentId) {
                const newItem = item;
                const children = createTree(data, item.id)
                if (children.length > 0) {
                    newItem.children = children
                }
                tree.push(newItem)
            }
        });
        return tree
    }
    const newCategories = createTree(multipleCategories)

    res.render("admin/categories/add_category", { data: {}, newCategories });
};

const store = async (req, res) => {
    const { body } = req;
    let error = null;
    const existingCategory = await CategoryModel.findOne({ title: body.title })
    if (existingCategory) {
        error = "Tên danh mục đã tồn tại!"
        return res.render("admin/categories/add_category", { data: { error } })
    }

    const category = {
        title: body.title,
        slug: slug(body.title),
        parent_id: body.parent_id
    }
    await CategoryModel(category).save();

    return res.redirect("/admin/categories");
}

const edit = async (req, res) => {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    res.render("admin/categories/edit_category", { category, data: {} });
};

const update = async (req, res) => {
    const { body } = req;
    const { id } = req.params;
    let error = null;

    const category = await CategoryModel.findById(id);
    const existingCategory = await CategoryModel.findOne({ _id: { $ne: id }, title: body.title })

    if (existingCategory) {
        error = " Danh mục đã tồn tại !"
        return res.render("admin/categories/edit_category", { category, data: { error } })
    }
    const newCategory = {
        title: body.title,
        slug: slug(body.title)
    }
    await CategoryModel.updateOne({ _id: id }, { $set: newCategory });
    res.redirect("/admin/categories")
}

const del = async (req, res) => {
    const { id } = req.params;
    const category = await CategoryModel.findById(id)
    if (category) {
        const categoryBin = new CategoryBinModel(category.toObject());
        await categoryBin.save()
        await CategoryModel.deleteOne({ _id: id })
    }
    const productsToMove = await ProductModel.find({cat_id :id});
    if (productsToMove.length > 0) {
        const updateProducts = []
        productsToMove.map(product=> {
            const thumbnails = product.thumbnails;
            for (const thumbnail of thumbnails) {
                const oldImagePath = path.join(__dirname, "../../public/Uploads/images", thumbnail);
                const newImagePath = path.join(__dirname, "../../public/Uploads/images/recycleProducts", path.basename(thumbnail));
                fs.renameSync(oldImagePath, newImagePath);
            }
            const newThumbnails = thumbnails.map(thumbnail => `recycleProducts/${path.basename(thumbnail)}`);

            const updatedProduct = {
                ...product.toObject(),
                move_to_prdBin: true,
                thumbnails: newThumbnails
            };
            updateProducts.push(updatedProduct)
        })
        console.log(updateProducts);
        await ProductBinModel.insertMany(updateProducts);
        await ProductModel.deleteMany({ cat_id: id, move_to_prdBin: true })
    }

    return res.redirect("/admin/categories")
};
module.exports = {
    index,
    create,
    store,
    edit,
    update,
    del,
};
