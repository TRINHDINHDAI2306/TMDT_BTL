const express = require("express");
const router = express.Router();


const commentController = require("../apps/controllers/CommentController");
router.get("/admin/comments",commentController.index)
router.get("/admin/comments/create",commentController.create)
router.post("/admin/comments/update",commentController.updateStatusComment)
router.post("/admin/comments/store",commentController.store)
router.get("/admin/comments/approved-:id",commentController.approved)
router.get("/admin/comments/delete:id",commentController.del)
router.post("/admin/comments/deleteAll",commentController.delAll)

module.exports = router;