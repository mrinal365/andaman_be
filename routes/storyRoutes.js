const express = require("express");
const router = express.Router();
const controller = require("../controllers/storyController");
const { protect: auth } = require("../middleware/auth");

router.post("/stories", auth, controller.createStory);
router.get("/stories/feed", auth, controller.getStoryFeed);
router.post("/stories/:id/like", auth, controller.likeStory);
router.post("/stories/:id/view", auth, controller.viewStory);
router.get("/stories/:id/likes", auth, controller.getStoryLikes);
router.get("/stories/:id/views", auth, controller.getStoryViews);

module.exports = router;
