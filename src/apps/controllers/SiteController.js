const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/CategoryModel");
const CommentModel = require("../models/CommentModel");
const CustomerModel = require("../models/CustomerModel");
const UserModel = require("../models/UserModel");
const moment = require("moment");
const pagination = require("../../common/pagination");
const ejs = require("ejs");
const transporter = require("../../common/transporter");
const path = require("path");
const orderModel = require("../models/orderModel");
const _ = require("lodash");
const axios = require("axios");
const bcrypt = require("bcrypt");
const qs = require("qs");
const { log } = require("console");

const home = async (req, res) => {
  const featured = await ProductModel.find({ featured: true })
    .sort({ _id: -1 })
    .limit(6);
  const latest = await ProductModel.find({ is_stock: true })
    .sort({ _id: -1 })
    .limit(6);
  res.render("site/index", {
    featured,
    latest,
  });
};
const category = async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const skip = page * limit - limit;

  const totalRows = await ProductModel.find({ cat_id: id }).countDocuments();
  const totalPages = Math.ceil(totalRows / limit);

  const category = await CategoryModel.findById(id);
  const products = await ProductModel.find({ cat_id: id })
    .sort({ _id: -1 })
    .limit(limit)
    .skip(skip);
  res.render("site/category", {
    products,
    category,
    pages: pagination(page, limit, totalRows),
    page,
    totalRows,
    totalPages,
  });
};
const product = async (req, res) => {
  const { error } = req.query;
  const { id } = req.params;

  const page = parseInt(req.query.page) || 1;
  const limit = 3;
  const skip = page * limit - limit;
  const totalRows = await CommentModel.find({ prd_id: id })
    .sort({ _id: -1 })
    .countDocuments();

  const totalPages = Math.ceil(totalRows / limit);

  const comments = await CommentModel.find({ prd_id: id, status: true })
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
  });
};

const comment = async (req, res) => {
  const { full_name, email, body } = req.body;
  const { id } = req.params;
  const checkEmail = req.session.email;
  const user = res.locals.user;

  const recaptchaToken = req.body["g-recaptcha-response"];
  if (!recaptchaToken) {
    return res.redirect(
      `${req.path}?error=Vui lòng xác nhận bạn không phải là robot`
    );
  }
  const secretKey = "LeywLopAAAAAFhfLU_rPZybwu_hnbI5gEEEgmVf";
  const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

  const response = await axios.post(recaptchaUrl);
  const recaptchaData = response.data;
  if (recaptchaData.success) {
    console.log("reCAPTCHA không hợp lệ");
    res.status(400).json({ err: "reCAPTCHA không hợp lệ" });
  }

  //kiểm tra đăng nhập
  if (!checkEmail && !user.full_name) {
    return res.redirect(
      `${req.path}?error=Bạn cần đăng nhập để có thể bình luận`
    );
  }
  let checkBody = body;
  const obscenities = [
    "fuck",
    "shit",
    "wtf",
    "dm",
    "d.m",
    "dmm",
    "tsb",
    "con chó",
    "ngu",
    "đần",
    "lol",
    "vãi đái",
  ];

  //so sánh word để gán ***
  for (let word of obscenities) {
    checkBody = checkBody.replace(
      new RegExp(word, "gi"),
      "*".repeat(word.length)
    );
  }
  const comment = {
    prd_id: id,
    full_name,
    email,
    body: checkBody,
  };
  await new CommentModel(comment).save();
  req.flash(
    "successMessage",
    "Bình luận của bạn đã được gửi thành công! Hiện đang chờ xét duyệt! Cám ơn bạn đã đóng góp ý kiến !"
  );
  return res.redirect(303, req.path);
  // res.status(200).json({ redirectUrl: req.path });
};

const editComment = async (req, res) => {
  const { id } = req.params;
  const comment = await CommentModel.findById(id);
  return res.render("site/edit-comment", { comment });
};

const updateComment = async (req, res) => {
  const { prd_id, id } = req.params;
  const { full_name, email, body } = req.body;
  let checkBody = body;
  const obscenities = [
    "fuck",
    "shit",
    "wtf",
    "dm",
    "d.m",
    "dmm",
    "tsb",
    "con chó",
    "ngu",
    "đần",
    "stupid",
    "vãi đái",
  ];

  const comment = await CommentModel.findById(id);
  const product = await ProductModel.findOne({ _id: prd_id });
  //so sánh word để gán ***
  for (let word of obscenities) {
    checkBody = checkBody.replace(
      new RegExp(word, "gi"),
      "*".repeat(word.length)
    );
  }
  const newComment = {
    prd_id,
    full_name,
    email,
    body: checkBody,
  };
  await CommentModel.updateOne(
    { _id: id, prd_id: prd_id },
    { $set: newComment }
  ).sort({ _id: -1 });
  return res.redirect(`/product-${product.slug}.${product._id}`);
};

const delComment = async (req, res) => {
  const { prd_id, id } = req.params;
  const comment = await CommentModel.findById(id);
  const product = await ProductModel.findOne({ _id: prd_id });
  await CommentModel.deleteOne({ prd_id: prd_id, _id: id });
  return res.redirect(`/product-$${product.slug}.${product._id}`);
};

const search = async (req, res) => {
  let keyword = req.query.keyword || ""; // Sử dụng chuỗi rỗng nếu keyword không tồn tại
  if (typeof keyword !== "string") {
    keyword = "";
  }
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const skip = limit * page - limit;
  const totalRows = await ProductModel.find({
    $text: { $search: keyword },
  }).countDocuments();
  const totalPages = Math.ceil(totalRows / limit);
  const products = await ProductModel.find({ $text: { $search: keyword } })
    .limit(limit)
    .skip(skip);
  return res.render("site/search", {
    products,
    keyword,
    page,
    pages: pagination(page, limit, totalRows),
    totalRows,
    totalPages,
  });
};

const addToCart = async (req, res) => {
  const { id, qty } = req.body;
  const items = req.session.cart;
  let isProductExist = false;

  const newItems = items.map((item) => {
    if (item.id === id) {
      item.qty += parseInt(qty);
      isProductExist = true;
    }
    return item;
  });

  if (!isProductExist) {
    const product = await ProductModel.findById(id);
    newItems.push({
      id,
      name: product.name,
      thumbnails: product.thumbnails,
      price: product.price,
      qty: parseInt(qty),
    });
  }
  req.session.cart = newItems;
  res.redirect("/cart");
};

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
  });
};

const updateItemCart = async (req, res) => {
  const { products } = req.body;
  const items = req.session.cart;

  const newItems = items?.map((item) => {
    item.qty = parseInt(products[item.id]["qty"]);
    return item;
  });
  req.session.cart = newItems;
  res.redirect("/cart");
};

const delItemCart = (req, res) => {
  const { id } = req.params;
  const items = req.session.cart;

  const newItems = items.filter((item) => item.id !== id);

  req.session.cart = newItems;
  res.redirect("/cart");
};
// ======= * * *  Ham Ban dau * * *  ======
// const order = async (req, res) => {


// Vnp bank
const order = async (req, res, next) => {
  try {
    const customer = res.locals.customer;
    let error;
    const items = req.session.cart;
    const { body } = req;
    const checkEmail = req.session.email; // lấy email từ session
    const total_price = items.reduce(
      (total, item) => total + item.price * item.qty,
      0
    );
    function generateRandomString(length) {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let randomString = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
      }
      return randomString;
    }

    const orderId = generateRandomString(10); // Độ dài của chuỗi ngẫu nhiên là 10

    const newOrder = {
      customer_id: customer._id,
      orderId: orderId,
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      items: items.map((item) => ({
        prd_id: item.id,
        qty: item.qty,
        price: item.price,
        name: item.name,
      })),
      total_price,
      payment_method: body.payment,
    };
    await orderModel(newOrder).save();
    req.session.cart = [];
    const viewFolder = req.app.get("views");

    if (!checkEmail && checkEmail !== body.email) {
      // kiểm tra nếu ko có email lưu session và checkmail khác email người dùng nhập vào từ form
      error = "Bạn cần đăng nhập để có thể mua hàng!";
      return res.render("site/cart", { data: { error } });
    }
    if (body.payment === "vnpay") {
      let date = new Date();
      let createDate = moment(date).format("YYYYMMDDHHmmss");

      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      let config = require("config");

      let tmnCode = config.get("vnpay.vnp_TmnCode");
      let secretKey = config.get("vnpay.vnp_HashSecret");
      let vnpUrl = config.get("vnpay.vnp_Url");
      let returnUrl = config.get("vnpay.vnp_ReturnUrl");
      const orderId = newOrder.orderId;
      // const names = items.map((item) => item.name);
      const amount = newOrder.total_price;

      let bankCode = "";

      let locale = "vn";
      if (locale === null || locale === "") {
        locale = "vn";
      }
      let currCode = "VND";
      var vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      vnp_Params = sortObject(vnp_Params);

      let querystring = require("qs");
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      res.redirect(vnpUrl);
      //Neu muon dung Redirect thi dong dong ben duoi
      // res.cookie("orderId", orderData._id + "", { maxAge: 720000 }).json({ code: "00", vnpUrl });
      //Neu muon dung Redirect thi mo dong ben duoi va dong dong ben tren
      // res.redirect(vnpUrl);
    } else if (body.payment === "zalopay") {
      const axios = require("axios");
      const CryptoJS = require("crypto-js");
      const moment = require("moment");

      const embed_data = {
        redirecturl: "https://docs.zalopay.vn/result",
      };

      const items = [{}];
      const transID = Math.floor(Math.random() * 1000000);
      const order = {
        app_id: config.get("zalopay.app_id"),
        app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
        app_user: "user123",
        app_time: Date.now(), // miliseconds
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: newOrder.total_price,
        description: `Payment for the order #${orderId}`,
        bank_code: "",
        callback_url: "https://b074-1-53-37-194.ngrok-free.app/callback",
      };

      // appid|app_trans_id|appuser|amount|apptime|embeddata|item
      const data =
        config.get("zalopay.app_id") +
        "|" +
        order.app_trans_id +
        "|" +
        order.app_user +
        "|" +
        order.amount +
        "|" +
        order.app_time +
        "|" +
        order.embed_data +
        "|" +
        order.item;
      order.mac = CryptoJS.HmacSHA256(
        data,
        config.get("zalopay.key1")
      ).toString();

      try {
        const result = await axios.post(config.get("zalopay.endpoint"), null, {
          params: order,
        });
        if (result.status === 200 && result.data.order_url) {
          return res.redirect(result.data.order_url);
        } else {
          return res.status(500).json({
            message: "Có lỗi xảy ra trong quá trình xử lý yêu cầu.",
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else if (body.payment === "momo") {
      var accessKey = "F8BBA842ECF85";
      var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      var orderInfo = "pay with MoMo";
      var partnerCode = "MOMO";
      var redirectUrl =
        "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
      var ipnUrl = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
      var requestType = "payWithMethod";
      var amount = newOrder.total_price;
      let orderId = partnerCode + new Date().getTime();
      var requestId = orderId;
      var extraData = "";
      var orderGroupId = "";
      var autoCapture = true;
      var lang = "vi";

      var rawSignature =
        "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&ipnUrl=" +
        ipnUrl +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        partnerCode +
        "&redirectUrl=" +
        redirectUrl +
        "&requestId=" +
        requestId +
        "&requestType=" +
        requestType;
      //puts raw signature
      console.log("--------------------RAW SIGNATURE----------------");
      console.log(rawSignature);
      //signature
      const crypto = require("crypto");
      var signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");
      console.log("--------------------SIGNATURE----------------");
      console.log(signature);

      //json object send to MoMo endpoint
      const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature,
      });
      // Call Api Axios
      // options for axios
      const options = {
        method: "POST",
        url: "https://test-payment.momo.vn/v2/gateway/api/create",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
        data: requestBody,
      };

      // Send the request and handle the response
      let result;
      try {
        result = await axios(options);
        return res.status(200).json(result.data);
      } catch (error) {
        return res
          .status(500)
          .json({ statusCode: 500, message: error.message });
      }
    }
  } catch (err) {
    next(err);
  }
};
// Return VNPay
const vnpayReturn = async (req, res, next) => {
  
  var vnp_Params = req.query;

  var secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  var config = require("config");
  var tmnCode = config.get("vnpay.vnp_TmnCode");
  var secretKey = config.get("vnpay.vnp_HashSecret");

  var querystring = require("qs");
  var signData = querystring.stringify(vnp_Params, { encode: false });

  var crypto = require("crypto");
  var hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // * * * * * Còn Bug thanh toán thành công ! * * * *
  if (secureHash === signed) {
    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
    try {
      const result = await orderModel.findOne(
        { orderId: vnp_Params["vnp_TxnRef"] }
      );
      
        // gui mail va tru so luong
      const items = result.items;
        for (const item of items) {
          const product = await ProductModel.findById(item.prd_id);
          if (!product) {
            return res.redirect(`/cart?error=Product with ID ${item.prd_id} does not exist`);
          }
          if (product.storehouse < item.qty) {
            await orderModel.deleteOne({
              orderId: vnp_Params["vnp_TxnRef"],
            });
            return res.redirect(
              `/cart?error=${product.name} Không đủ hàng trong kho`
            );
          }
          product.storehouse -= item.qty;
          await product.save();
        }
        const updateOrder = await orderModel.findOneAndUpdate(
          { orderId: vnp_Params["vnp_TxnRef"] },
          { isPaid: true },
          { new: true }
        );if (!updateOrder) {
          throw new Error("Order does not exist");
        }
      const viewFolder = req.app.get("views");
      const html = await ejs.renderFile(
        path.join(viewFolder, "site/email-order.ejs"),
        {
          ...updateOrder.toObject(), // Ensure the result is plain object for EJS
          items,
        }
      );

      await transporter.sendMail({
        from: '"Mobile Store" <mobileshop@gmail.com>', // sender address
        to: result.email, // list of receivers
        subject: "Xác nhận đơn hàng từ Mobile Store ✔", // Subject line
        html, // html body
      });
      return res
        .cookie("vnpay", "success", { maxAge: 720000 })
        .render("site/success");
    } catch (err) {
      next(err);
    }
  } else {
    res.cookie("vnpay", "fail", { maxAge: 720000 }).render("site/success");
  }
};
// Vnpay Check status
const checkVnpayStatus = async (req, res) => {
  let vnp_Params = req.query;
  let secureHash = vnp_Params["vnp_SecureHash"];

  let orderId = vnp_Params["vnp_TxnRef"];
  let rspCode = vnp_Params["vnp_ResponseCode"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  let config = require("config");
  let secretKey = config.get("vnp_HashSecret");
  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
 let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  let paymentStatus = "0"; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
  //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
  //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

  let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
  let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
  if (secureHash === signed) {
    //kiểm tra checksum
    if (checkOrderId) {
      if (checkAmount) {
        if (paymentStatus == "0") {
          //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
          if (rspCode == "00") {
            //thanh cong
            //paymentStatus = '1'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
            res.status(200).json({
              RspCode: "00",
              Message: "Success",
            });
          } else {
            //that bai
            //paymentStatus = '2'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
            res.status(200).json({
              RspCode: "00",
              Message: "Success",
            });
          }
        } else {
          res.status(200).json({
            RspCode: "02",
            Message: "This order has been updated to the payment status",
          });
        }
      } else {
        res.status(200).json({
          RspCode: "04",
          Message: "Amount invalid",
        });
      }
    } else {
      res.status(200).json({ RspCode: "01", Message: "Order not found" });
    }
  } else {
    res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
  }
};
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
// * * * = = = = =  End Ham Thanh Toan VNPAY = = = = = =  * * * * *

// * * * = = = = =  Start Ham Thanh Toan ZaloPay = = = = = = * * * *
const paymentZalopay = async (req, res) => {
  const axios = require("axios");
  const CryptoJS = require("crypto-js");
  const moment = require("moment");

  const embed_data = {
    redirecturl: "https://docs.zalopay.vn/result",
  };

  const items = [{}];
  const transID = Math.floor(Math.random() * 1000000);
  const order = {
    app_id: config.get("zalopay.app_id"),
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
    app_user: "user123",
    app_time: Date.now(), // miliseconds
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: newOrder.total_price,
    description: ` Payment for the order #${orderId}`,
    bank_code: "zalopayapp",
    callback_url: "https://b074-1-53-37-194.ngrok-free.app/callback",
  };

  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const data =
    config.get("zalopay.app_id") +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;
  order.mac = CryptoJS.HmacSHA256(data, config.get("zalopay.key1")).toString();

  try {
    const result = await axios.post(config.get("zalopay.endpoint"), null, {
      params: order,
    });
    console.log(result);
    return res.status(200).json(result.data);
  } catch (error) {
    console.log(error);
  }
};
// Ham thanh toan thanh cong
const paymentZalopaySuccess = async (req, res) => {
  let result = {};
  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("mac =", mac);

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, config.key2);
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson["app_trans_id"]
      );

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result);
};
// Check zalopay status
const checkZalopayStatus = async (req, res) => {
  const app_trans_id = req.params.app_trans_id;
  let postData = {
    app_id: config.app_id,
    app_trans_id: app_trans_id, // Input your app_trans_id
  };

  let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  let postConfig = {
    method: "post",
    url: "https://sb-openapi.zalopay.vn/v2/query",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify(postData),
  };

  try {
    const result = await axios(postConfig);
    console.log(result);
    return res.status(200).json(result.data);
  } catch (error) {
    console.log(error);
  }
};
const paymentMomoSuccess = async (req, res) => {
  /**
    resultCode = 0: giao dịch thành công.
    resultCode = 9000: giao dịch được cấp quyền (authorization) thành công .
    resultCode <> 0: giao dịch thất bại.
   */
  console.log("callback: ");
  console.log(req.body);
  return res.status(204).json(req.body);
};

// Check momo status
const checkMomoStatus = async (req, res) => {
  const { orderId } = req.body;

  // const signature = accessKey=$accessKey&orderId=$orderId&partnerCode=$partnerCode
  // &requestId=$requestId
  var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var accessKey = "F8BBA842ECF85";
  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: "MOMO",
    requestId: orderId,
    orderId: orderId,
    signature: signature,
    lang: "vi",
  });

  // options for axios
  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/query",
    headers: {
      "Content-Type": "application/json",
    },
    data: requestBody,
  };

  const result = await axios(options);

  return res.status(200).json(result.data);
};

// * * * = = = = =  End Ham Thanh Toan ZaloPay = = = = = = * * *
const success = (req, res) => {
  res.render("site/success");
};

// render trang tìm mật khẩu bằng email
const forgetPassword = async (req, res) => {
  res.render("site/forgets/forget", { data: {} });
};

// kiểm tra email trong db; gửi otp về email
const validateEmail = async (req, res) => {
  const { email } = req.body;
  let error = null;

  const existingUser = await CustomerModel.findOne({ email });
  if (!existingUser) {
    error = "Email không tồn tại";
    return res.render("site/forgets/forget", { data: { error } });
  }
  const otp = Math.floor(Math.random() * 1000000);
  req.session.optCode = otp;

  const viewFolder = req.app.get("views");
  const html = await ejs.renderFile(
    path.join(viewFolder, "/site/forgets/Otp-sendEmail.ejs"),
    {
      otp,
      existingUser,
    }
  );
  await transporter.sendMail({
    from: '"Mobile Store 👻" <quantri.vietproshop@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Mã xác thực OTP cho tài khoản customer MobileShop✔", // Subject line
    html, // html body
  });
  req.session.emailChanged = email;

  return res.render("site/forgets/OTP", { email, data: { error }, otp });
};

const validateOtp = async (req, res) => {
  const checkOtp = req.body.otp;
  const ValidOpt = req.session.optCode;
  const email = req.session.emailChanged;
  let error = "Mã Otp không chính xác";
  if (checkOtp != ValidOpt) {
    return res.render("site/forgets/OTP", { data: { error }, email });
  } else {
    return res.render("site/forgets/ChangePassword", { email, data: {} });
  }
};

// thay doi password
const changePassword = async (req, res) => {
  const email = req.session.emailChanged;
  const { password, confirmPassword } = req.body;
  let error = null;

  if (password !== confirmPassword) {
    error = "Mật khẩu không khớp";
    return res.render("site/forgets/ChangePassword", {
      email,
      data: { error },
    });
  }

  const hash = await bcrypt.hash(password, 7);
  const user = await CustomerModel.findOne({ email });

  const newUser = {
    email: user.email,
    full_name: user.full_name,
    address: user.address,
    phone: user.phone,
    password: hash,
  };

  await CustomerModel.updateOne({ email: email }, { $set: newUser });
  delete req.session.emailChanged;
  return res.redirect("/forget/success");
};
const forgetSuccess = (req, res) => {
  res.render("site/forgets/success");
};

const informationOrders = async (req, res) => {
  const id = req.session._id;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = page * limit - limit;
  let count = 1;
  const totalRows = await orderModel.find().countDocuments();
  const totalPages = Math.ceil(totalRows / limit);

  const orders = await orderModel
    .find({ customer_id: id })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);
  res.render("site/information-orders", {
    orders,
    count,
    totalPages,
    page,
    pages: pagination(page, limit, totalRows),
  });
};
const informationCustomer = async (req, res) => {
  const id = req.session._id;
  const customer = await CustomerModel.findById(id);

  res.render("site/information-customer", { customer, data: {} });
};

const editInformationCustomer = async (req, res) => {
  const id = req.session._id;
  const customer = await CustomerModel.findById(id);
  console.log(customer);

  res.render("site/edit-information-customer", { customer, data: {} });
};
const updateInformationCustomer = async (req, res) => {
  const { body } = req;
  const id = req.session._id;
  const hashed = await bcrypt.hash(body.password, 7);

  const customer = await CustomerModel.findById(id);

  let error = "";
  if (body.password !== body.re_password) {
    error = "Mật khẩu không khớp";
    return res.render("site/edit-information-customer", {
      customer,
      data: { error },
    });
  }
  const newCustomer = {
    email: body.email,
    full_name: body.full_name,
    address: body.address,
    phone: body.phone,
    password: hashed,
  };
  await CustomerModel.updateOne({ _id: id }, { $set: newCustomer });
  return res.redirect("/information/infoCustomer");
};

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
  vnpayReturn,
  checkVnpayStatus,
  paymentZalopay,
  paymentZalopaySuccess,
  checkZalopayStatus,
  paymentMomoSuccess,
  checkMomoStatus,
};
