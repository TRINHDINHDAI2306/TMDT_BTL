const ProductModel = require("../models/ProductModel");
const UserModel = require("../models/UserModel");
const CommentModel = require("../models/CommentModel");
const OrderModel = require("../models/orderModel");
const CategoryModel = require("../models/CategoryModel");
const SliderModel = require("../models/SliderModel");
const BannerModel = require("../models/BannerModel");
const RootModel = require("../models/rootModel");
const CategoryBinModel = require("../models/CategoryBinModel");
const ProductBinModel = require("../models/ProductBinModel");
const UserBinModel = require("../models/UserBinModel");
const CustomerModel = require("../models/CustomerModel");
const passport = require("passport");
const slug = require("slug");
const bcrypt = require("bcrypt");
const index = async (req, res) => {
  const total_products = (await ProductModel.find()).length;
  const total_users = (await UserModel.find()).length;
  const total_comments = (await CommentModel.find()).length;
  const total_categories = (await CategoryModel.find()).length;
  const total_orders = (await OrderModel.find()).length;
  const total_sliders = (await SliderModel.find()).length;
  const total_banners = (await BannerModel.find()).length;
  const total_roots = (await RootModel.find()).length;
  const total_CategoriesBin = (await CategoryBinModel.find()).length;
  const total_UsersBin = (await UserBinModel.find()).length;
  const total_ProductsBin = (await ProductBinModel.find()).length;
  const total_Customers = (await CustomerModel.find()).length;
  res.render("admin/dashboard", {
    total_products,
    total_users,
    total_comments,
    total_categories,
    total_orders,
    total_sliders,
    total_banners,
    total_roots,
    total_CategoriesBin,
    total_ProductsBin,
    total_UsersBin,
    total_Customers,
  });
};

// Đăng ký
const register = (req, res) => {
  res.render("admin/users/register_user", { data: {} });
};

const store = async (req, res) => {
  const { body } = req;
  let error = null;

  const existingUser = await UserModel.findOne({ email: body.email });

  if (existingUser) {
    error = " Email đã tồn tại, đề nghị nhập lại !";
    return res.render("admin/users/register_user", { data: { error } });
  }
  if (body.password !== body.re_password) {
    error = "Mật khẩu không khớp, đề nghị nhập lại !";
    return res.render("admin/users/register_user", { data: { error } });
  }
  const hashed = await bcrypt.hash(body.password, 7);
  const newUser = {
    full_name: body.full_name,
    slug: slug(body.full_name),
    email: body.email,
    password: hashed,
  };
  await new UserModel(newUser).save();
  res.redirect("/admin/success");
};

const success = (req, res) => {
  return res.render("admin/users/success_register");
};

//Đăng nhập

const login = (req, res) => {
  res.render("admin/login", { data: {} });
};

const postLogin = async (req, res) => {
  let { email, password } = req.body;
  let error;

  const user = await UserModel.findOne({ email });

  if (!user) {
    error = "Email hoặc Password không đúng";
    return res.render("admin/login", { data: { error } });
  }
  const passwordCheck = await bcrypt.compare(password, user.password);
  if (!passwordCheck) {
    error = "Password không đúng";
    return res.render("admin/login", { data: { error } });
  }
  req.session._id = user._id;
  req.session.email = email;

  return res.redirect("/admin/dashboard");
};


const logout = (req, res) => {
  req.user = null;
  req.session.destroy();
  return res.redirect("/admin/login");
};
module.exports = {
  index,
  register,
  store,
  success,
  login,
  logout,
  postLogin,
};
