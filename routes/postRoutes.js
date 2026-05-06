// const router = require("express").Router();
// const ctrl = require("../controllers/postController");
// const auth = require("../middleware/auth");


// router.post("/posts", auth, ctrl.createPost);
// router.get("/posts/:postId", auth, ctrl.getPost);
// router.patch("/posts/:postId", auth, ctrl.updatePost);
// router.delete("/posts/:postId", auth, ctrl.deletePost);

// module.exports = router;




const router = require("express").Router();
const ctrl = require("../controllers/postController");

const { protect: auth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const checkId = require("../middleware/objectId");

const {
    createPostSchema,
    updatePostSchema
} = require("../validators/postValidator");


// CREATE POST
router.post(
    "/posts",
    auth,
    validate(createPostSchema),
    ctrl.createPost
);


// GET SINGLE POST
router.get(
    "/posts/:postId",
    auth,               // change to authOptional later if needed
    checkId("postId"),
    ctrl.getPost
);


// UPDATE POST
router.patch(
    "/posts/:postId",
    auth,
    checkId("postId"),
    validate(updatePostSchema),
    ctrl.updatePost
);


// DELETE POST
router.delete(
    "/posts/:postId",
    auth,
    checkId("postId"),
    ctrl.deletePost
);

module.exports = router;