const User = require("../models/User");
const feedService = require("../services/feed/feedService");

// @desc    Get user profile by handle
// @route   GET /api/users/:handle
// @access  Public
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findOne({ handle: req.params.handle })
            .select("-password")
            .lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if viewing user follows this user
        if (req.user) {
            const Follow = require("../models/Follow");
            const follow = await Follow.findOne({
                followerId: req.user._id,
                followingId: user._id
            });
            user.isFollowing = !!follow;
        }

        res.json(user);
    } catch (err) {
        next(err);
    }
};

// @desc    Get user posts by handle
// @route   GET /api/users/:handle/posts
// @access  Public
exports.getUserPosts = async (req, res, next) => {
    try {
        const user = await User.findOne({ handle: req.params.handle });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const data = await feedService.getUserPosts(
            user._id,
            req.user?._id,
            req.query.cursor
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
};

exports.updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const {
            avatar,
            coverImage,
            coverPosition,
            name,
            bio,
            location,
            website,
            tags,
            password
        } = req.body;

        // Basic Info
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;
        if (website !== undefined) user.website = website;

        // Media
        if (avatar) user.avatar = avatar;
        if (coverImage) user.coverImage = coverImage;
        if (typeof coverPosition === 'number') user.coverPosition = coverPosition;

        // Arrays
        if (tags) user.tags = tags;

        // Security
        if (password) {
            user.password = password;
        }

        await user.save();

        const response = user.toObject();
        delete response.password;

        res.json(response);
    } catch (err) {
        next(err);
    }
};

// @desc    Search users by name or handle
// @route   GET /api/users/search?q=...
// @access  Private
exports.searchUsers = async (req, res, next) => {
    try {
        const query = req.query.q || '';
        if (!query.trim()) {
            return res.json([]);
        }

        const regex = new RegExp(query, 'i');
        const users = await User.find({
            $or: [{ name: regex }, { handle: regex }]
        })
        .select('_id name handle avatar verified')
        .limit(20)
        .lean();

        res.json(users);
    } catch (err) {
        next(err);
    }
};
