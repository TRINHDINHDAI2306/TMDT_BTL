
module.exports = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  user: process.env.MAIL_USER || "quantri.vietproshop@gmail.com",
  pass: process.env.MAIL_PASS || "tjpj rclg ithn rkby",
};
