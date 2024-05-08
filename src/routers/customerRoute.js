const express = require("express");
const router = express.Router();


const CustomerController = require("../apps/controllers/CustomerController")
router.get("/admin/customers", CustomerController.index);
router.get("/admin/customers/register", CustomerController.register);
router.post("/admin/customers/store", CustomerController.store);
router.get("/admin/customers/success", CustomerController.success);
router.get("/admin/customers/login", CustomerController.login);
router.post("/admin/customers/login", CustomerController.postLogin);
router.get("/admin/customers/logout", CustomerController.logout);

module.exports = router;