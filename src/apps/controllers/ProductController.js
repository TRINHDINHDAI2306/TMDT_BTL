const ProductModel = require("../models/ProductModel")
const CategoryModel = require("../models/CategoryModel")
const ProductBinModel = require("../models/ProductBinModel")
const pagination = require("../../common/pagination")
const filterForm = require("../../common/filterForm")
const slug = require("slug")
const fs = require("fs")
const path = require("path")
const {isValidImageExtension} = require("../../libs/ValidImageExtension")
const index = async (req, res) => {
    const filterFormData = filterForm(req.query);
    let find = { deleted: false }

    // form filter
    if (filterFormData.find) {
        find = { ...find, ...filterFormData.find }
    }
    const sort = { ...filterFormData.sort, _id: -1 };

    // tổng số sản phẩm khi tìm kiếm
    const find_total_products = await ProductModel.countDocuments(find);

    const multiData = [
        { title: "Còn Hàng", value: true },
        { title: "Hết Hàng", value: false },
        { title: "Xóa sản phẩm", value: "deleted" },
    ];

    //menu da cap
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

    //Phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = page * limit - limit;
    let count = 1;


    const products = await ProductModel
        .find(find)
        .populate({ path: "cat_id" })
        .sort(sort)
        .skip(skip)
        .limit(limit);
    const totalRows = await ProductModel
        .find()
        .countDocuments()
    const totalPages = Math.ceil(find_total_products / limit);

    // console.log(pagination(page,limit,totalRows));
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
    });

};
const create = async (req, res) => {
    const catogories = await CategoryModel
        .find()
        .sort({ _id: -1 });

    res.render("admin/products/add_product", {
        catogories,
        data: {}
    });
};

const store = async (req, res) => {
    let error = "";
    const { body, files } = req;
    console.log(files);

    const thumbnails = [];
    const product =
    {
        name: body.name,
        price: body.price,
        warranty: body.warranty,
        accessories: body.accessories,
        promotion: body.promotion,
        status: body.status,
        cat_id: body.cat_id,
        featured: body.featured == "on",
        description: body.description,
        is_stock: body.is_stock,
        slug: slug(body.name),
        thumbnails: thumbnails
    }

    const catogories = await CategoryModel
        .find()
        .sort({ _id: -1 });

    // kiểm tra định dạng ảnh
    for (let file of files) {
        if (!isValidImageExtension(file.originalname)) {
            error = 'Ảnh không đúng định dạng (.jpg, .jpeg, .png, .webp)';
            return res.render("admin/products/add_product", { catogories, data: { error } });
        }
    }
    // Kiểm tra số lượng tệp tin tải lên
    // if (files && files.length > 6) {
    //     error = 'Không được phép tải lên nhiều hơn 6 tệp ảnh.';
    //     return res.render("admin/products/add_product", { catogories, data: { error } });
    // }


    if (files) {
        files.map(file => {
            const uniqueSuffix = Date.now();
            const thumbnail = `products/${uniqueSuffix + "-" + file.originalname}`
            fs.renameSync(file.path, path.resolve("src/public/Uploads/images", thumbnail));
            thumbnails.push(thumbnail)
        });
        await new ProductModel(product)
            .save()
            .then(() => {
                console.log("Product saved successfully.");
                return res.redirect("/admin/products");
            })
            .catch(err => {
                console.error("Error saving product:", err);
                return res.status(500).send("Error saving product");
            });
    } else {
        // Nếu không có ảnh nào được tải lên, không lưu sản phẩm và chuyển hướng trở lại trang products
        console.log("No images uploaded. Product not saved.");
        return res.redirect("/admin/products");
    }

}

const edit = async (req, res) => {
    const { id } = req.params;
    const categories = await CategoryModel.find();
    const product = await ProductModel.findById({ _id: id });
    res.render("admin/products/edit_product", { product, categories,data : {} });
};

const update = async (req, res) => {
    const { body, files } = req;
    const { id } = req.params;
    const product = await ProductModel.findById({ _id: id });
    let error = ""
    const thumbnails = [];
    const newProduct =
    {
        name: body.name,
        price: body.price,
        warranty: body.warranty,
        accessories: body.accessories,
        promotion: body.promotion,
        status: body.status,
        cat_id: body.cat_id,
        featured: body.featured == "on",
        description: body.description,
        is_stock: body.is_stock,
        slug: slug(body.name),
        thumbnails: thumbnails
    }

    const catogories = await CategoryModel
        .find()
        .sort({ _id: -1 });
    // kiểm tra định dạng ảnh
    for (let file of files) {
        if (!isValidImageExtension(file.originalname)) {
            error = 'Ảnh không đúng định dạng (.jpg, .jpeg, .png, .webp)';
            return res.render("admin/products/edit_product", { catogories, data: { error },product });
        }
    }

    if (files) {
        files.forEach(file => {
            const uniqueSuffix = Date.now();
            const thumbnail = `products/${uniqueSuffix + "-" + file.originalname}`
            console.log(file.originalname);
            fs.renameSync(file.path, path.resolve("src/public/Uploads/images", thumbnail))
            thumbnails.push(thumbnail)
        })
    }
    await ProductModel.updateOne({ _id: id }, { $set: newProduct })
    res.redirect("/admin/products")
}

const del = async (req, res) => {
    const id = req.params.id;
    await ProductModel.deleteOne({ _id: id });
    res.redirect("/admin/products");
};

const delAll = async (req, res) => {
    const { checkedIds } = req.body;

    const productsToDelete = await ProductModel.find({ _id: { $in: checkedIds } });

    if (productsToDelete.length > 0) {
        const updateProducts = []
        productsToDelete.map(product => {
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
        await ProductBinModel.insertMany(updateProducts);
        await ProductModel.deleteMany({ _id: { $in: checkedIds }, move_to_prdBin: true })
    }

    // Chuyển hướng về trang sản phẩm sau khi xóa
    return res.redirect("/admin/products");
};

module.exports = {
    index,
    create,
    store,
    edit,
    update,
    del,
    delAll
};
