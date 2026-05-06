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
