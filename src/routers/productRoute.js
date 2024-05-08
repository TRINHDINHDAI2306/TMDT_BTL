const express = require("express");
const router = express.Router();
const UploadMw = require("../apps/middlewares/uploadMw")



const productController = require("../apps/controllers/ProductController");
router.get("/admin/products",productController.index);
router.get("/admin/products/create", productController.create);
router.post("/admin/products/store", UploadMw.array("thumbnail",20) , productController.store);
router.get("/admin/products/edit/:id",productController.edit);
router.post("/admin/products/update/:id",UploadMw.array("thumbnail",20),productController.update);
router.get("/admin/products/delete/:id",productController.del);
router.post("/admin/products/deleteAll",productController.delAll);


module.exports = router;