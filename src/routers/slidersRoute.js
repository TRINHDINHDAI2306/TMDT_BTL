const express = require("express");
const router = express.Router();
const uploadMw = require("../apps/middlewares/uploadMw")
const SliderController = require("../apps/controllers/SliderController")


router.get("/admin/sliders",SliderController.index)
router.get("/admin/sliders/create",SliderController.create)
router.post("/admin/sliders/store",uploadMw.single("image"),SliderController.store)
router.get("/admin/sliders/approved-:id",SliderController.approved)
router.get("/admin/sliders/edit-:id",SliderController.edit)
router.post("/admin/sliders/update-:id",uploadMw.single("image"),SliderController.update)

router.get("/admin/sliders/delete-:id",SliderController.del)

module.exports = router;