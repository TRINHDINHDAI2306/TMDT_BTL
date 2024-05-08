const UserModel = require("../models/UserModel")

const checkLogin = (req, res, next) => {
    if (req.session.email && req.session.password) {
        res.redirect("/")
    }
    next();

}
// kiểm tra người dùng phải đăng nhập thành công mới được vào
const checkMemberRole = async (req, res, next) => {
    // Kiểm tra nếu người dùng đã đăng nhập
    const { email, password } = req.session;
    if (email && password) {
        const user = await UserModel.findOne({ email})
        console.log(user);
        // Nếu có user
        if (user) {
            if (user.role === "Member") {
                if (req.originalUrl !== "/") {
                    return res.redirect("/");
                }
            } else{
                return next();
            }
        } 
    } else{
        return res.redirect("/");
    }
};

module.exports = {
    checkLogin,
    checkMemberRole
}
