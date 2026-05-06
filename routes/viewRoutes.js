const router = require("express").Router();
const ctrl = require("../controllers/viewController");
const { authOptional } = require("../middleware/auth");
// if auth fails, req.user stays undefined — that's fine

router.post("/posts/:postId/view", authOptional, ctrl.recordView);

module.exports = router;