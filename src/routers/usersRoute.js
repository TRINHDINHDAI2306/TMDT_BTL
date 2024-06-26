const express = require("express");
const router = express.Router();


const usersController = require("../apps/controllers/UsersController");
router.get("/admin/users", usersController.index);
router.get("/admin/users/create", usersController.create);
router.post("/admin/users/store", usersController.store);
router.get("/admin/users/edit/:id",usersController.edit);
router.post("/admin/users/edit/:id",usersController.update);
router.get("/admin/users/delete/:id",usersController.del);
module.exports = router;