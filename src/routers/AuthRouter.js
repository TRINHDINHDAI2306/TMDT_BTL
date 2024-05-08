const express = require("express");
const router = express.Router();
const authMw = require("../apps/middlewares/AuthMw")
const authController = require("../apps/controllers/AuthController");


router.get("/admin/login", authController.login);
router.get("/admin/register", authController.register);
router.post("/admin/store", authController.store);
router.get("/admin/success", authController.success);
router.post("/admin/login", authController.postLogin);
router.get("/admin/logout", authController.logout);
router.get("/admin/dashboard",authController.index);

module.exports = router;