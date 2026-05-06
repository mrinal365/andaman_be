const Follow = require("../models/Follow");
const User = require("../models/User");
const notificationService = require("../services/notification/notificationService");

// @desc    Follow a user
// @route   POST /api/users/:userId/follow
// @access  Private
exports.followUser = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const targetUserId = req.params.userId;

        if (userId.toString() === targetUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingFollow = await Follow.findOne({
            followerId: userId,
            followingId: targetUserId
        });

        if (existingFollow) {
            return res.status(400).json({ message: "Already following this user" });
        }

        await Follow.create({
            followerId: userId,
            followingId: targetUserId
        });

        // Increment follower count for target user and following count for current user
        await User.findByIdAndUpdate(targetUserId, { $inc: { "stats.followers": 1 } });
        await User.findByIdAndUpdate(userId, { $inc: { "stats.following": 1 } });

        // 🔔 Notify the followed user
        notificationService.send({
            recipient: targetUserId,
            sender: userId,
            type: "follow",
            title: "You have a new follower",
            body: `${req.user.name} started following you`,
            data: { followerId: userId },
        });

        res.json({ success: true, message: `You followed ${targetUser.name}` });
    } catch (err) {
        next(err);
    }
};

// @desc    Unfollow a user
// @route   POST /api/users/:userId/unfollow
// @access  Private
exports.unfollowUser = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const targetUserId = req.params.userId;

        const follow = await Follow.findOneAndDelete({
            followerId: userId,
            followingId: targetUserId
        });

        if (!follow) {
            return res.status(400).json({ message: "Not following this user" });
        }

        // Decrement counts
        await User.findByIdAndUpdate(targetUserId, { $inc: { "stats.followers": -1 } });
        await User.findByIdAndUpdate(userId, { $inc: { "stats.following": -1 } });

        res.json({ success: true, message: "Unfollowed successfully" });
    } catch (err) {
        next(err);
    }
};

// @desc    Check if following
// @route   GET /api/users/:userId/is-following
// @access  Private
exports.checkIsFollowing = async (req, res, next) => {
    try {
        const follow = await Follow.findOne({
            followerId: req.user._id,
            followingId: req.params.userId
        });

        res.json({ isFollowing: !!follow });
    } catch (err) {
        next(err);
    }
};

// @desc    Get followers list
// @route   GET /api/users/:userId/followers
// @access  Public
exports.getFollowers = async (req, res, next) => {
    try {
        const followers = await Follow.find({ followingId: req.params.userId })
            .populate("followerId", "name handle avatar verified")
            .lean();

        const list = followers.map(f => f.followerId).filter(Boolean);

        // Add follow status for viewer
        if (req.user) {
            const viewerId = req.user._id;
            const followings = await Follow.find({
                followerId: viewerId,
                followingId: { $in: list.map(u => u._id) }
            }).lean();
            const followingMap = {};
            followings.forEach(f => { followingMap[f.followingId.toString()] = true; });
            list.forEach(u => { u.isFollowing = !!followingMap[u._id.toString()]; });
        }

        res.json(list);
    } catch (err) {
        next(err);
    }
};

// @desc    Get following list
// @route   GET /api/users/:userId/following
// @access  Public
exports.getFollowing = async (req, res, next) => {
    try {
        const following = await Follow.find({ followerId: req.params.userId })
            .populate("followingId", "name handle avatar verified")
            .lean();

        const list = following.map(f => f.followingId).filter(Boolean);

        // Add follow status for viewer
        if (req.user) {
            const viewerId = req.user._id;
            const followings = await Follow.find({
                followerId: viewerId,
                followingId: { $in: list.map(u => u._id) }
            }).lean();
            const followingMap = {};
            followings.forEach(f => { followingMap[f.followingId.toString()] = true; });
            list.forEach(u => { u.isFollowing = !!followingMap[u._id.toString()]; });
        }

        res.json(list);
    } catch (err) {
        next(err);
    }
};

