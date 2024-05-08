const express = require("express");
const router = express.Router();
const UploadMw = require("../apps/middlewares/uploadMw")
const ConfigsController = require("../apps/controllers/ConfigsController")
router.get("/admin/configs",ConfigsController.index)
router.get("/admin/configs/update/:id",ConfigsController.update)
router.post("/admin/configs/store/:id",UploadMw.fields([{ name: "logo_header" }, { name: "logo_footer" }]),ConfigsController.store)

module.exports = router;