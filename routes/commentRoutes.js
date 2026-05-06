// const router = require("express").Router();
// const ctrl = require("../controllers/commentController");
// const auth = require("../middleware/auth");

// router.post("/posts/:postId/comments", auth, ctrl.addComment);
// router.post("/comments/:commentId/reply", auth, ctrl.replyComment);
// router.get("/posts/:postId/comments", auth, ctrl.getComments);
// router.delete("/comments/:commentId", auth, ctrl.deleteComment);

// module.exports = router;



const router = require("express").Router();
const ctrl = require("../controllers/commentController");

const { protect: auth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const checkId = require("../middleware/objectId");

const { commentSchema } = require("../validators/commentValidator");


// ADD COMMENT
router.post(
    "/posts/:postId/comments",
    auth,
    checkId("postId"),
    validate(commentSchema),
    ctrl.addComment
);


// REPLY COMMENT
router.post(
    "/comments/:commentId/reply",
    auth,
    checkId("commentId"),
    validate(commentSchema),
    ctrl.replyComment
);


// GET COMMENTS
router.get(
    "/posts/:postId/comments",
    auth,  // optional later
    checkId("postId"),
    ctrl.getComments
);


// DELETE COMMENT
router.delete(
    "/comments/:commentId",
    auth,
    checkId("commentId"),
    ctrl.deleteComment
);

module.exports = router;