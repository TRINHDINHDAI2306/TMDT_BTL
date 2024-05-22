const UserModel = require("../models/UserModel");
const UserBinModel = require("../models/UserBinModel")
const pagination = require("../../common/pagination");
const bcrypt = require("bcrypt")
const vndPrice = require("../../libs/vndPrice");
const slug = require("slug")
const index = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = page * limit - limit;
  const query = {};
  query.is_delete = false;
  const users = await UserModel
    .find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .skip(skip);

  const totalRows = await UserModel.find(query).countDocuments();
  const totalPages = Math.ceil(totalRows / limit);

  const delError = req.query.delError;

  const user = await UserModel.findOne({ email: req.session.email });
  const role = user?.role;

  res.render("admin/users/user", {
    data: {
      users,
      currentPage: page,
      totalPages,
      pages: pagination(page, totalPages),
      delError,
    },
    role,
  });
};

const create =async (req,res)=>{

    res.render("admin/users/add_user",{data:{}});
};

const store = async (req,res)=>{
    const {body}= req;
    const existingUser = await UserModel.findOne({email: body.email});

    let error = null;
    if(body.password !== body.re_password){
        error = "Password không khớp "
        return(
            res.render("admin/users/add_user",{data: {error}})
        )
    }
    if(existingUser){
        error="Email đã tồn tại !"
        return (res.render("admin/users/add_user",{data:{error}}))
    }
    const hashed =  await bcrypt.hash(body.password, 7);

    const user = {
        full_name: body.full_name,
        slug: slug(body.full_name),
        email:body.email,
        password: hashed,
        role:body.role,
    }
    await new UserModel(user).save();
    res.redirect("/admin/users")
}

const edit = async (req,res)=>{
    const id = req.params.id;
    const user = await UserModel.findById(id);

    res.render("admin/users/edit_user",{user, data:{}})
};

const update = async (req, res) => {
  const { id } = req.params
  const { role } = req.body

  await UserModel.updateOne({ _id: id }, { $set: { role: role } })
  res.redirect('/admin/users')
}

const del = async(req,res)=>{
    const id = req.params.id;
    await UserModel.deleteOne({_id:id})
    res.redirect("/admin/users");
};

const delAll = async(req,res)=>{
    const { checkedIds } = req.body;
    const usersToDel = await UserModel.find({_id:{$in: checkedIds}})
    if(usersToDel.length >0){
        const updateUsers = []
        usersToDel?.map(user =>{
            const userData = user.toObject();
            const updateUser = {
                ...userData,
                move_to_userBin : true,
            }
            updateUsers.push(updateUser)
        })
        await UserBinModel.insertMany(updateUsers);
        await UserModel.deleteMany({_id: {$in:checkedIds},move_to_userBin:true})
    }
    return res.redirect("/admin/users")
}
module.exports = {
    index,
    create,
    store,
    edit,
    update,
    del,
    delAll,
};


