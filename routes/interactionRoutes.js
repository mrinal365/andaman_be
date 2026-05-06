// const router = require("express").Router();
// const ctrl = require("../controllers/interactionController");
// const auth = require("../middleware/auth");

// router.post("/posts/:postId/like", auth, ctrl.likePost);
// router.post("/comments/:commentId/like", auth, ctrl.likeComment);
// router.post("/posts/:postId/save", auth, ctrl.savePost);
// router.post("/posts/:postId/vote", auth, ctrl.votePost);
// router.post("/posts/:postId/reshare", auth, ctrl.resharePost);

// module.exports = router;

const router = require("express").Router();
const ctrl = require("../controllers/interactionController");

const { protect: auth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const checkId = require("../middleware/objectId");

const { voteSchema } = require("../validators/interactionValidator");


// LIKE POST
router.post(
    "/posts/:postId/like",
    auth,
    checkId("postId"),
    ctrl.likePost
);


// LIKE COMMENT
router.post(
    "/comments/:commentId/like",
    auth,
    checkId("commentId"),
    ctrl.likeComment
);


// SAVE POST
router.post(
    "/posts/:postId/save",
    auth,
    checkId("postId"),
    ctrl.savePost
);


// VOTE POST
router.post(
    "/posts/:postId/vote",
    auth,
    checkId("postId"),
    validate(voteSchema),
    ctrl.votePost
);


// RESHARE POST
router.post(
    "/posts/:postId/reshare",
    auth,
    checkId("postId"),
    ctrl.resharePost
);


// GET LIKES (Author Only)
router.get(
    "/posts/:postId/likes",
    auth,
    checkId("postId"),
    ctrl.getPostLikes
);

module.exports = router;