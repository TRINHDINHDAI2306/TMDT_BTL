const express = require("express");
const router = express.Router();
const RecycleBinController = require("../apps/controllers/RecycleBinController")

router.get("/admin/recycle_bin/products",RecycleBinController.products)
router.post("/admin/recycle_bin/products/move",RecycleBinController.moveProducts)
router.post("/admin/recycle_bin/products/deleteAll",RecycleBinController.delAllProducts)
router.get("/admin/recycle_bin/categories",RecycleBinController.categories)
router.post("/admin/recycle_bin/categories/move",RecycleBinController.moveCategories)
router.post("/admin/recycle_bin/categories/deleteAll",RecycleBinController.delAllCategories)
router.get("/admin/recycle_bin/users",RecycleBinController.users)
router.post("/admin/recycle_bin/users/move",RecycleBinController.moveUsers)
router.post("/admin/recycle_bin/users/deleteAll",RecycleBinController.delAllUsers)



module.exports = router;