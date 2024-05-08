const express = require("express");
const router = express.Router();

const OrderController = require("../apps/controllers/OrderController")

router.get("/admin/orders",OrderController.index)
router.get("/admin/orders/delete-:id",OrderController.del)
router.post("/admin/orders/deleteAll",OrderController.delAll)
router.get("/admin/orders/approved-:id",OrderController.approved)

module.exports = router;