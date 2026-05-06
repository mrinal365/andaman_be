const Story = require("../../models/feed/Story");
const StoryLike = require("../../models/feed/StoryLike");
const StoryView = require("../../models/feed/StoryView");
const User = require("../../models/User");

/**
 * Create a new story.
 * Constraint: Max 5 stories per 24-hour period (simplified to 5/day based on server time).
 */
exports.createStory = async (userId, imageUrl) => {
    // Check daily limit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const count = await Story.countDocuments({
        authorId: userId,
        createdAt: { $gte: startOfDay }
    });

    if (count >= 5) {
        throw new Error("You have reached your daily limit of 5 stories.");
    }

    const story = await Story.create({
        authorId: userId,
        imageUrl
    });

    await story.populate("authorId", "name avatar verified handle");
    return story;
};

/**
 * Get the story feed.
 * Returns stories from the last 24 hours, grouped by author.
 */
exports.getStoryFeed = async (viewerId) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await Story.find({
        createdAt: { $gte: twentyFourHoursAgo }
    })
    .populate("authorId", "name avatar verified handle")
    .sort({ createdAt: -1 })
    .lean();

    // Group stories by author
    const authorMap = {};
    
    for (const s of stories) {
        const authorId = s.authorId._id.toString();
        if (!authorMap[authorId]) {
            authorMap[authorId] = {
                author: s.authorId,
                stories: [],
                hasUnseen: false
            };
        }
        
        // Check if seen & liked by viewer
        let isSeen = false;
        let isLiked = false;
        if (viewerId) {
            isSeen = await StoryView.exists({ storyId: s._id, userId: viewerId });
            isLiked = await StoryLike.exists({ storyId: s._id, userId: viewerId });
        }
        
        const storyWithState = {
            ...s,
            isSeen: !!isSeen,
            isLiked: !!isLiked
        };
        
        if (!isSeen) authorMap[authorId].hasUnseen = true;
        authorMap[authorId].stories.push(storyWithState);
    }

    // Convert map to array and sort by latest story
    return Object.values(authorMap).sort((a, b) => {
        const aLatest = a.stories[0].createdAt;
        const bLatest = b.stories[0].createdAt;
        return bLatest - aLatest;
    });
};

/**
 * Like or unlike a story.
 */
exports.likeUnlikeStory = async (storyId, userId) => {
    const existingLike = await StoryLike.findOne({ storyId, userId });

    if (existingLike) {
        await StoryLike.deleteOne({ _id: existingLike._id });
        const story = await Story.findByIdAndUpdate(storyId, { $inc: { "stats.likeCount": -1 } }, { new: true });
        return { liked: false, story };
    } else {
        await StoryLike.create({ storyId, userId });
        const story = await Story.findByIdAndUpdate(storyId, { $inc: { "stats.likeCount": 1 } }, { new: true });
        return { liked: true, story };
    }
};

/**
 * Record a story view.
 * Unique per person.
 */
exports.recordStoryView = async (storyId, userId) => {
    try {
        await StoryView.create({ storyId, userId });
        const story = await Story.findByIdAndUpdate(storyId, { $inc: { "stats.viewCount": 1 } }, { new: true });
        return { newlyViewed: true, story };
    } catch (err) {
        // If duplicate key error, it means user already viewed
        if (err.code === 11000) {
            return { newlyViewed: false };
        }
        throw err;
    }
};

/**
 * Get users who liked a story.
 */
exports.getStoryLikes = async (storyId) => {
    const likes = await StoryLike.find({ storyId })
        .populate("userId", "name handle avatar verified")
        .sort({ createdAt: -1 })
        .lean();
    
    return likes.map(l => l.userId);
};

/**
 * Get users who viewed a story.
 */
exports.getStoryViews = async (storyId) => {
    const views = await StoryView.find({ storyId })
        .populate("userId", "name handle avatar verified")
        .sort({ createdAt: -1 })
        .lean();
    
    return views.map(v => v.userId);
};
