const express = require("express");
const router = express.Router();
const categoriesController = require("../apps/controllers/CategoriesController");


router.get("/admin/categories",categoriesController.index);
router.get("/admin/categories/create",categoriesController.create);
router.post("/admin/categories/store",categoriesController.store);
router.get("/admin/categories/edit/:id",categoriesController.edit);
router.post("/admin/categories/update/:id",categoriesController.update);
router.get("/admin/categories/delete/:id",categoriesController.del);
module.exports = router;