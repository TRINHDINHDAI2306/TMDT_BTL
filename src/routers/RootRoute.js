const router = require("express").Router();
const RootController = require("../apps/controllers/RootController");

router.get("/admin/roots",RootController.index);
router.post("/admin/roots/move",RootController.moveProducts);
router.post("/admin/roots/deleteAll",RootController.delAll);






module.exports = router;