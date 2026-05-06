const express = require("express");
const router = express.Router();
const {
    getUserProfile,
    getUserPosts,
    updateUserProfile,
    searchUsers
} = require("../controllers/userController");
const {
    followUser,
    unfollowUser,
    checkIsFollowing,
    getFollowers,
    getFollowing
} = require("../controllers/followController");
const { protect, authOptional } = require("../middleware/auth");

router.get("/search", protect, searchUsers);
router.get("/:handle", authOptional, getUserProfile);
router.get("/:handle/posts", authOptional, getUserPosts);
router.patch("/profile", protect, updateUserProfile);

router.post("/:userId/follow", protect, followUser);
router.post("/:userId/unfollow", protect, unfollowUser);
router.get("/:userId/is-following", protect, checkIsFollowing);
router.get("/:userId/followers", authOptional, getFollowers);
router.get("/:userId/following", authOptional, getFollowing);


module.exports = router;
