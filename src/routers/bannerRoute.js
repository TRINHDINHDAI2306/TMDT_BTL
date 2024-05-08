const express = require("express")
const router = express.Router();
const uploadMw = require("../apps/middlewares/uploadMw")
const BannerController = require("../apps/controllers/BannerController")


router.get("/admin/banners",BannerController.index)
router.get("/admin/banners/create",BannerController.create)
router.post("/admin/banners/store",uploadMw.single("image"),BannerController.store)
router.get("/admin/banners/edit-:id",BannerController.edit)
router.post("/admin/banners/update-:id",uploadMw.single("image"),BannerController.update)
router.get("/admin/banners/delete-:id",BannerController.del)
router.get("/admin/banners/approved-:id",BannerController.approved)

module.exports =router;