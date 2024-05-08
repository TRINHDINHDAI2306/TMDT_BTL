
// tạo server từ express
const express = require("express");
const app = express();
const config = require("config")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const session = require("express-session");
const cartMw = require("./middlewares/cartMw")
const shareMw = require("./middlewares/shareMw");
const flash = require('express-flash');
const passport = require("passport")

require("dotenv").config();

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: config.get("app.session_key"),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: config.get("app.session_secure") }
}))


app.use(express.urlencoded({ extended: true })); // lay du lieu nguoi dung nhap vao tu form
app.use(express.json());
app.use("/static", express.static(config.get("app.static_folder"))) // dđịnh nghĩa đường dẫn đến thư mục tĩnh. /static: tên để gọi lần sau,  __dirname: là đường dẫn tuyệt đối đến thư mục lưu trữ : app.js
app.use(cookieParser())
app.use(cors())
app.use(cartMw.cart)
app.use(
  shareMw.categories,
  shareMw.emailUser,
  shareMw.cartItems,
  shareMw.formatPrice,
  shareMw.config,
  shareMw.sliders,
  shareMw.banners,
  shareMw.emailCustomer,
  shareMw.userValidate,
  shareMw.nameProducts,
);
// Sử dụng session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Sử dụng flash middleware sau session middleware
app.use(flash());


app.set("views", config.get("app.views_folder"));
app.set("view engine", config.get("app.view_engine"))

// passport
app.use(passport.initialize());
app.use(passport.session());



app.use(require(`${__dirname}/../routers/web.js`));
module.exports = app; 
