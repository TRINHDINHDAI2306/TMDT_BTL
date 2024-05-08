const CommentModel = require("../models/CommentModel")
const pagination = require("../../common/pagination");
const categoryModel = require("../models/CategoryModel");
const productModel = require("../models/ProductModel");

const index = async (req, res) => {
    let count = 1;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = page * limit - limit;

    const totalRows = await CommentModel.find().countDocuments();
    const totalPages = Math.ceil(totalRows / limit);
    const comments = await CommentModel
        .find()
        .populate({
            path: "prd_id",
            populate: {
                path: "cat_id"
            }
        })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    res.render("admin/comments/comments", {
        comments,
        page,
        pages: pagination(page, limit, totalRows),
        totalPages,
        count
    });
};

const updateStatusComment = async (req,res)=>{
    
}

const create = async (req, res) => {
    const categories = await categoryModel.find().sort({ _id: -1 });
    const products = await productModel
    .find()
    .populate({path: "cat_id"})
    return res.render("admin/comments/create-comment", { categories,products })
}

const store = async (req, res) => {
    const { body } = req;
    const obscenities = ["fuck", "shit", "wtf", "dm", "d.m","stupid","ngu","đần","con chó", "vãi đái"];
    const checkBody = body.body;


    for (let word of obscenities) {
        updateBody = checkBody.replace(new RegExp(word, "gi"), "*".repeat(word.length))
    }
    const newComment = {
        full_name: body.full_name,
        email: body.email,
        body: checkBody
    }
    await new CommentModel(newComment).save()
    return res.redirect("/admin/comments")
}

const approved = async (req,res) => {
    const {id} = req.params;
    const { page } = req.query;
    const comment = await CommentModel.findById(id);
    const approvedComment = { status : !comment.status}
    if(approvedComment){
        await CommentModel.updateOne({_id:id},{$set:approvedComment})
    }
    return res.redirect(`/admin/comments?page=${page}`)
}

const del = async (req, res) => {
    const { id } = req.params;
    await CommentModel.deleteOne({ _id: id })
    return res.redirect("/admin/comments")
}

const delAll = async (req,res)=>{
    const {checkedIds} = req.body;
    await CommentModel.deleteMany({_id: { $in: checkedIds}})
    return res.redirect("/admin/comments");
}

module.exports = {
    index,
    create,
    updateStatusComment,
    store,
    approved,
    del,
    delAll
};
