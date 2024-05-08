const ProductModel = require("../models/ProductModel")
const CategoryModel = require("../models/CategoryModel");
const CommentModel = require("../models/CommentModel");
const CustomerModel = require("../models/CustomerModel")
const UserModel = require("../models/UserModel")
const moment = require("moment")
const pagination = require("../../common/pagination")
const ejs = require("ejs");
const transporter = require("../../common/transporter");
const path = require("path");
const OrderModel = require("../models/orderModel");
const _ = require("lodash");
const axios = require("axios");
const bcrypt = require("bcrypt");



const home = async (req, res) => {
    const featured = await ProductModel
        .find({ featured: true })
        .sort({ _id: -1 })
        .limit(6);
    const latest = await ProductModel
        .find({ is_stock: true })
        .sort({ _id: -1 })
        .limit(6)
    res.render("site/index", {
        featured,
        latest,
    })
}
const category = async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = page * limit - limit;

    const totalRows = await ProductModel
        .find({ cat_id: id })
        .countDocuments();
    const totalPages = Math.ceil(totalRows / limit);

    const category = await CategoryModel.findById(id)
    const products = await ProductModel
        .find({ cat_id: id })
        .sort({ _id: -1 })
        .limit(limit)
        .skip(skip);
    res.render("site/category",
        {
            products,
            category,
            pages: pagination(page, limit, totalRows),
            page,
            totalRows,
            totalPages
        })
}
const product = async (req, res) => {
    const { error } = req.query;
    const { id } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const skip = page * limit - limit;
    const totalRows = await CommentModel
        .find({ prd_id: id })
        .sort({ _id: -1 })
        .countDocuments();

    const totalPages = Math.ceil(totalRows / limit)

    const comments = await CommentModel
        .find({ prd_id: id, status: true })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    const product = await ProductModel.findById(id);
    const { full_name, email } = res.locals.customer || {};
    return res.render("site/product", {
        product,
        comments,
        moment,
        page,
        pages: pagination(page, limit, totalRows),
        totalPages,
        data: { error },
        full_name,
        email,
        successMessage: req.flash("successMessage"), // Lấy thông báo từ session (nếu có)
    })
}

const comment = async (req, res) => {
    const { full_name, email, body } = req.body;
    const { id } = req.params;
    const checkEmail = req.session.email;
    const user = res.locals.user;

    const recaptchaToken = req.body["g-recaptcha-response"];
    if (!recaptchaToken) {

        return res.redirect(`${req.path}?error=Vui lòng xác nhận bạn không phải là robot`)

    }
    const secretKey = "LeywLopAAAAAFhfLU_rPZybwu_hnbI5gEEEgmVf";
    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    const response = await axios.post(recaptchaUrl);
    const recaptchaData = response.data;
    if (recaptchaData.success) {
        console.log("reCAPTCHA không hợp lệ");
        res
            .status(400)
            .json({ err: 'reCAPTCHA không hợp lệ' })
    }

    //kiểm tra đăng nhập
    if (!checkEmail && !user.full_name) {
        return res.redirect(`${req.path}?error=Bạn cần đăng nhập để có thể bình luận`)
    }
    let checkBody = body;
    const obscenities = ["fuck", "shit", "wtf", "dm", "d.m", "dmm", "tsb", "con chó", "ngu", "đần", "lol", "vãi đái"];

    //so sánh word để gán ***
    for (let word of obscenities) {
        checkBody = checkBody.replace(new RegExp(word, "gi"), "*".repeat(word.length))
    }
    const comment = {
        prd_id: id,
        full_name,
        email,
        body: checkBody,
    }
    await new CommentModel(comment).save();
    req.flash("successMessage", "Bình luận của bạn đã được gửi thành công! Hiện đang chờ xét duyệt! Cám ơn bạn đã đóng góp ý kiến !");
    return res.redirect(303, req.path);
    // res.status(200).json({ redirectUrl: req.path });

}

const editComment = async (req, res) => {
    const { id } = req.params;
    const comment = await CommentModel.findById(id)
    return res.render("site/edit-comment", { comment })
}

const updateComment = async (req, res) => {
    const { prd_id, id } = req.params;
    const { full_name, email, body } = req.body;
    let checkBody = body;
    const obscenities = ["fuck", "shit", "wtf", "dm", "d.m", "dmm", "tsb", "con chó", "ngu", "đần", "stupid", "vãi đái"];

    const comment = await CommentModel.findById(id);
    const product = await ProductModel.findOne({ _id: prd_id })
    //so sánh word để gán ***
    for (let word of obscenities) {
        checkBody = checkBody.replace(new RegExp(word, "gi"), "*".repeat(word.length))
    }
    const newComment = {
        prd_id,
        full_name,
        email,
        body: checkBody,
    }
    await CommentModel.updateOne({ _id: id, prd_id: prd_id }, { $set: newComment }).sort({ _id: -1 })
    return res.redirect(`/product-${product.slug}.${product._id}`)
}

const delComment = async (req, res) => {
    const { prd_id, id } = req.params;
    const comment = await CommentModel.findById(id)
    const product = await ProductModel.findOne({ _id: prd_id })
    await CommentModel.deleteOne({ prd_id: prd_id, _id: id })
    return res.redirect(`/product-$${product.slug}.${product._id}`)
}



const search = async (req, res) => {
    let keyword = req.query.keyword || ""; // Sử dụng chuỗi rỗng nếu keyword không tồn tại
    if (typeof keyword !== 'string') {
        keyword = "";
    } const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = limit * page - limit;
    const totalRows = await ProductModel
        .find({ $text: { $search: keyword } })
        .countDocuments();
    const totalPages = Math.ceil(totalRows / limit);
    const products = await ProductModel
        .find({ $text: { $search: keyword } })
        .limit(limit)
        .skip(skip)
    return res.render("site/search", {
        products,
        keyword,
        page,
        pages: pagination(page, limit, totalRows),
        totalRows,
        totalPages
    })
}

const addToCart = async (req, res) => {
    const { id, qty } = req.body;
    const items = req.session.cart;
    let isProductExist = false;

    const newItems = items.map((item) => {
        if (item.id === id) {
            item.qty += parseInt(qty)
            isProductExist = true;
        }
        return item;
    });

    if (!isProductExist) {
        const product = await ProductModel.findById(id)
        newItems.push({
            id,
            name: product.name,
            thumbnails: product.thumbnails,
            price: product.price,
            qty: parseInt(qty)
        })
    }
    req.session.cart = newItems;
    res.redirect("/cart")
}

const cart = (req, res) => {
    const { body } = req;
    const items = req.session.cart;
    const { full_name, email, phone, address } = res.locals.customer || {};

    res.render("site/cart", {
        items,
        body,
        data: {},
        full_name,
        email,
        phone,
        address,

    })
}

const updateItemCart = async (req, res) => {
    const { products } = req.body;
    const items = req.session.cart;

    const newItems = items?.map((item) => {
        item.qty = parseInt(products[item.id]["qty"])
        return item;
    })
    req.session.cart = newItems;
    res.redirect("/cart")
}

const delItemCart = (req, res) => {
    const { id } = req.params;
    const items = req.session.cart;

    const newItems = items.filter((item) => item.id !== id)

    req.session.cart = newItems;
    res.redirect("/cart")
};

const order = async (req, res) => {
    const customer = res.locals.customer
    let error;
    const items = req.session.cart;
    const { body } = req;
    const checkEmail = req.session.email; // lấy email từ session
    const total_price = items.reduce((total, item) => total + item.price * item.qty, 0)
    const viewFolder = req.app.get("views");
    const html = await ejs.renderFile(path.join(viewFolder, "/site/email-order.ejs"), {
        ...body,
        items
    }
    );
    if (!checkEmail && checkEmail !== body.email) {    /// kiểm tra nếu ko có email lưu session và checkmail khác email người dùng nhập vào từ form
        error = "Bạn cần đăng nhập để có thể mua hàng!";
        return res.render("site/cart", { data: { error } })
    }

    await transporter.sendMail({
        from: '"VietPro Store 👻" <quantri.vietproshop@gmail.com>', // sender address
        to: body.email, // list of receivers
        subject: "Xác nhận đơn hàng✔", // Subject line
        html, // html body
    })

    // const customer = await CustomerModel.findById(id)
    console.log(customer);
    // Tạo Oder để lưu vào Db
    const newOrder = {
        customer_id: customer._id,
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        items: items.map(item => ({
            prd_id: item.id,
            qty: item.qty,
            price: item.price,
            name: item.name
        })),
        total_price,
    }
    await OrderModel(newOrder).save();
    req.session.cart = [];
    return res.redirect("/success")
}
const success = (req, res) => {
    res.render("site/success")
}

// render trang tìm mật khẩu bằng email
const forgetPassword = async (req, res) => {

    res.render("site/forgets/forget", { data: {} })

}

// kiểm tra email trong db; gửi otp về email
const validateEmail = async (req, res) => {
    const { email } = req.body;
    let error = null;

    const existingUser = await CustomerModel.findOne({ email });
    if (!existingUser) {
        error = "Email không tồn tại"
        return res.render("site/forgets/forget", { data: { error } })
    }
    const otp = Math.floor(Math.random() * 1000000);
    req.session.optCode = otp;

    const viewFolder = req.app.get("views");
    const html = await ejs.renderFile(path.join(viewFolder, "/site/forgets/Otp-sendEmail.ejs"), {
        otp,
        existingUser,
    });
    await transporter.sendMail({
        from: '"VietPro Store 👻" <quantri.vietproshop@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Mã xác thực OTP cho tài khoản customer VietProShop✔", // Subject line
        html, // html body
    })
    req.session.emailChanged = email;

    return res.render("site/forgets/OTP", { email, data: { error }, otp })
}

const validateOtp = async (req, res) => {
    const checkOtp = req.body.otp;
    const ValidOpt = req.session.optCode;
    const email = req.session.emailChanged;
    let error = "Mã Otp không chính xác"
    if (checkOtp != ValidOpt) {
        return res.render("site/forgets/OTP", { data: { error }, email })
    } else {
        return res.render("site/forgets/ChangePassword", { email, data: {} })
    }
}

// thay doi password
const changePassword = async (req, res) => {
    const email = req.session.emailChanged;
    const { password, confirmPassword } = req.body;
    let error = null;

    if (password !== confirmPassword) {
        error = "Mật khẩu không khớp"
        return res.render("site/forgets/ChangePassword", { email, data: { error } })
    }

    const hash = await bcrypt.hash(password, 7)
    const user = await CustomerModel.findOne({ email });

    const newUser = {
        email: user.email,
        full_name: user.full_name,
        address: user.address,
        phone: user.phone,
        password: hash,
    }

    await CustomerModel.updateOne({ email: email }, { $set: newUser });
    delete req.session.emailChanged;
    return res.redirect("/forget/success")
}
const forgetSuccess = (req, res) => {
    res.render("site/forgets/success")
}

const informationOrders = async (req, res) => {
    const id = req.session._id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = page * limit - limit;
    let count = 1;
    const totalRows = await OrderModel.find().countDocuments();
    const totalPages = Math.ceil(totalRows / limit);

    const orders = await OrderModel
        .find({ customer_id: id })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
    res.render("site/information-orders", {
        orders,
        count,
        totalPages,
        page,
        pages: pagination(page, limit, totalRows)
    })
}
const informationCustomer = async(req,res)=>{
    const id = req.session._id;
    const customer = await CustomerModel.findById(id);
    console.log(customer);
    
    res.render("site/information-customer",{customer,data:{}})
}

const editInformationCustomer = async (req,res)=>{
    const id = req.session._id;
    const customer = await CustomerModel.findById(id);
    console.log(customer);
    
    res.render("site/edit-information-customer",{customer,data:{}})
}
const updateInformationCustomer = async (req,res)=>{
    const {body} = req;
    const id = req.session._id;
    const hashed = await bcrypt.hash(body.password,7)

    const customer = await CustomerModel.findById(id);

    let error = "";
    if(body.password !== body.re_password){
        error = "Mật khẩu không khớp"
        return res.render("site/edit-information-customer",{customer,data:{error}})
    }
    const newCustomer = {
        email : body.email,
        full_name : body.full_name,
        address : body.address,
        phone : body.phone,
        password : hashed,
    }
    await CustomerModel.updateOne({ _id: id }, { $set: newCustomer })
    return res.redirect("/information/infoCustomer")
}

module.exports = {
    home,
    category,
    product,
    comment,
    editComment,
    updateComment,
    delComment,
    search,
    cart,
    addToCart,
    updateItemCart,
    delItemCart,
    order,
    success,
    forgetPassword,
    validateEmail,
    validateOtp,
    changePassword,
    forgetSuccess,
    informationOrders,
    informationCustomer,
    editInformationCustomer,
    updateInformationCustomer,
}


