const ConfigsModel = require("../models/configModel");
const fs = require("fs")
const path = require("path")
const index = async (req, res) => {
    const config = await ConfigsModel.findOne();
    res.render("admin/configs/config", { config })

}
const update = async (req, res) => {
    const { id } = req.params;
    const config = await ConfigsModel.findById({ _id: id });
    res.render("admin/configs/edit_config", { config })

}
const store = async (req, res) => {
    const { id } = req.params;
    const { body, files } = req;
    const config = {
        body: body.body,
        address: body.address,
        service: body.service,
        hotline: body.hotline,
        email: body.email,
        register: body.register,
    }
    if (files) {
        if (files.logo_header) {
            const logoHeaderFile = files.logo_header[0];
            // Đường dẫn mới (newPath) cho logo_header
            const logoHeaderPath = `logos/${logoHeaderFile.originalname}`;
            // Đường dẫn cũ (oldPath) cho logo_header
            const logoHeaderOldPath = logoHeaderFile.path;
            // Di chuyển và đổi tên file logo_header
            fs.renameSync(logoHeaderOldPath, path.resolve("src/public/Uploads/images", logoHeaderPath));
            config["logo_header"] = logoHeaderPath;
        }

        if (files.logo_footer) {
            const logoFooterFile = files.logo_footer[0];
            const logoFooterPath = `logos/${logoFooterFile.originalname}`;
            const logoFooterOldPath = logoFooterFile.path;
            fs.renameSync(logoFooterOldPath, path.resolve("src/public/Uploads/images", logoFooterPath));
            config["logo_footer"] = logoFooterPath;
        }
    }
    await ConfigsModel.updateOne({ _id: id }, { $set: config })
    return res.redirect("/admin/configs")
}
module.exports = {
    index,
    update,
    store
}