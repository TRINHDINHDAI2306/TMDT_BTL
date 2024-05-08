const BannerModel = require("../models/BannerModel");
const fs = require("fs")
const path = require("path")
const pagination = require("../../common/pagination");
const {isValidImageExtension} = require("../../libs/ValidImageExtension")

const index = async (req, res) => {
    const limit = 5;
    const page = Number(req.query.page) || 1;
    const skip = page * limit - limit;
    const totalRows = await BannerModel.find().countDocuments();
    const totalPages = Math.ceil(totalRows / limit)
    let count = 1;



    const banners = await BannerModel
        .find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    res.render("admin/banners/banners", {
        page,
        limit,
        totalPages,
        count,
        pages: pagination(page, limit, totalRows),
        banners
    })
};

const create = async(req,res)=>{
    res.render("admin/banners/add_banner",{data : {}})
}

const store = async(req,res)=>{
    let error = "";
    const {body, file} = req;

    const banner = {
        name : body.name,
        urlBanner : body.urlBanner,
    }
    if (!isValidImageExtension(file.originalname)) {
        error = 'Ảnh không đúng định dạng (.jpg, .jpeg, .png, .webp)';
        return res.render("admin/banners/add_banner", { data: { error } });
    }
    if(file){
        const image = `banners/${file.originalname}`
        fs.renameSync(file.path,path.resolve("src/public/Uploads/images",image))
        banner["image"] = image;
        new BannerModel(banner).save();
        return res.redirect("/admin/banners")
    }

}

const edit = async(req,res)=>{
    const {id} = req.params;
    const banner = await BannerModel.findById({_id:id});
    res.render("admin/banners/edit_banner",{banner})
}

const update = async(req,res)=>{
    const {body,file} = req;
    const {id} = req.params;

    const banner = {
        name : body.name,
        urlBanner : body.urlBanner,
    }
    if(file){
        const image = `banners/${file.originalname}`
        fs.renameSync(file.path,path.resolve("src/public/Uploads/images",image))
        banner["image"] = image; 
    }
    await BannerModel.updateOne({_id:id},{$set:banner})
    return res.redirect("/admin/banners")

};

const approved = async(req,res)=>{
    const {id} = req.params;
    const banner = await BannerModel.findById(id)
    const approvedBanner = {status: !banner.status}
    if(approvedBanner){
        await BannerModel.updateOne({_id: id},{$set : approvedBanner})
    }
    return res.redirect("back")
};

const del = async(req,res)=>{
    const {id} = req.params;
    await BannerModel.deleteOne({_id: id})
    return res.redirect("/admin/banners")
}

module.exports = {
    index,
    create,
    store,
    edit,
    update,
    del,
    approved,


}