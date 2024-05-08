const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/ProductModel")
const pagination = require("../../common/pagination")


const index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = page * limit - limit;
    let count = 1;
    const totalRows = await OrderModel.find().countDocuments();
    const totalPages = Math.ceil(totalRows / limit);

    const orders = await OrderModel
        .find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    res.render("admin/orders/order", {
        orders,
        count,
        totalPages,
        page,
        pages : pagination(page,limit,totalRows)
    })
}

const del = async (req,res)=>{
    const {id} = req.params;
    await OrderModel.deleteOne({_id:id});
    res.redirect("/admin/orders")       
}
const delAll = async (req,res)=>{
    const {checkedIds} = req.body;
    await OrderModel.deleteMany({_id:{$in:checkedIds}})
    return res.redirect("/admin/orders")
}

const approved = async (req,res) => {
    const {id} = req.params;
    const { page } = req.query;
    const order = await OrderModel.findById(id);
    const approvedOrder = { confirmed : !order.confirmed}
    if(approvedOrder){
        await OrderModel.updateOne({_id:id},{$set:approvedOrder})
    }
    return res.redirect(`/admin/orders?page=${page}`)
}


module.exports = {
    index,
    del,
    delAll,
    approved,
}