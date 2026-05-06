// const router = require("express").Router();
// const ctrl = require("../controllers/feedController");
// const auth = require("../middleware/auth");

// router.get("/feed", auth, ctrl.getFeed);

// module.exports = router;


const router = require("express").Router();
const ctrl = require("../controllers/feedController");
const { authOptional, protect } = require("../middleware/auth");

// main feed
router.get("/feed", protect, ctrl.getFeed);

// separate sections
router.get("/feed/guides", authOptional, ctrl.getGuides);
router.get("/feed/news", authOptional, ctrl.getNews);
router.get("/feed/saved", protect, ctrl.getSavedPosts);

module.exports = router;