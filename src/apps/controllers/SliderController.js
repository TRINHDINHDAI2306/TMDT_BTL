const SliderModel = require("../models/SliderModel");
const fs = require("fs")
const path = require("path")
const pagination = require("../../common/pagination")

const index = async (req,res)=>{
    const page = Number(req.query.page) || 1;
    const limit = 5;
    const skip = page*limit - limit;
    let count = 1;

    const totalRows = await SliderModel.find().countDocuments();
    const totalPages = Math.ceil(totalRows/limit)

    const sliders = await SliderModel
    .find()
    .sort({_id:-1})
    .skip(skip)
    .limit(limit);

    res.render("admin/sliders/sliders",{
        sliders,
        count,
        page,
        totalPages,
        pages : pagination(page,limit,totalRows)
    })
}

const create = async(req,res)=>{

    res.render("admin/sliders/add_slider")
}
const store = async(req,res)=>{
    const {body,file} = req;
    const slider = {
        name : body.name 
    }
    if(file){
        const image = `sliders/${file.originalname}`
        fs.renameSync(file.path,path.resolve("src/public/Uploads/images",image))
        slider["image"] = image;
        new SliderModel(slider).save();
       return res.redirect("/admin/sliders")
    }
}

const edit= async (req,res)=>{
    const {id} = req.params;
    const slider = await SliderModel.findById(id)
    return res.render("admin/sliders/edit_slider",{slider})
}

const update = async(req,res)=>{
    const {body,file} = req;
    const {id} = req.params;
    const slider = {
        name : body.name
    }
    if(file){
        const image = `sliders/${file.originalname}`
        fs.renameSync(file.path,path.resolve("src/public/Uploads/images",image))
        slider["image"] = image;
    }
    await SliderModel.updateOne({_id:id},{$set: slider})
    return res.redirect("/admin/sliders")
}

const del = async (req,res)=>{
    const {id} = req.params;
    await SliderModel.deleteOne({_id: id})
    res.redirect("/admin/sliders")
}

const approved = async (req,res)=>{
    const {id} = req.params;
    const slider = await SliderModel.findById(id);
    const approvedSlider = {status : !slider.status}
    if(approvedSlider){
        await SliderModel.updateOne({_id:id},{$set : approvedSlider})
    }
    return res.redirect("back")
}

module.exports = {
    index,
    create,
    store,
    approved,
    edit,
    update,
    del,

}