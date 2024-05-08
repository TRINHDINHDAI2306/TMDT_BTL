const CustomerModel = require("../models/CustomerModel");
const bcrypt = require("bcrypt");
const slug = require("slug");

const index = async (req, res) => {
  const count = 1;
  const customers = await CustomerModel.find().sort({ _id: -1 });

  res.render("admin/customers/customers", {
    count,
    customers,
  });
};

const register = async (req, res) => {
  res.render("admin/customers/register_customer", { data: {} });
};

const store = async (req, res) => {
  const { body } = req;
  let error = null;
  const existingCustomer = await CustomerModel.findOne({ email: body.email });
  if (existingCustomer) {
    error = "Email đã tồn tại, đề nghị nhập lại !";
    return res.render("admin/customers/register_customer", { data: { error } });
  }
  if (body.password !== body.re_password) {
    error = "Mật khẩu không khớp, đề nghị nhập lại !";
    return res.render("admin/users/register_user", { data: { error } });
  }
  const hashed = await bcrypt.hash(body.password, 7);
  const newCustomer = {
    full_name: body.full_name,
    slug: slug(body.full_name),
    email: body.email,
    password: hashed,
    phone: body.phone,
    address: body.address,
  };
  await new CustomerModel(newCustomer).save();
  return res.redirect("/admin/customers/success");
};

const success = (req, res) => {
  res.render("admin/customers/success_register");
};

const login = (req, res) => {
  res.render("admin/customers/login", { data: {} });
};

const postLogin = async (req, res) => {
  let { email, password } = req.body;
  let error;

  const customer = await CustomerModel.findOne({ email });

  if (!customer) {
    error = "Email hoặc Password không đúng";
    return res.render("admin/customers/login", { data: { error } });
  }
  const passwordCheck = await bcrypt.compare(password, customer.password);
  if (!passwordCheck) {
    error = "Password không đúng";
    return res.render("admin/login", { data: { error } });
  }
  req.session._id = customer._id;
  req.session.email = email;

  return res.redirect("/");
};

const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

module.exports = {
  index,
  register,
  store,
  success,
  login,
  postLogin,
  logout,
};
