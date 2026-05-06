const PostView = require("../../models/feed/PostView");
const Post = require("../../models/feed/Post");


// ========================
// RECORD VIEW (ANTI-SPAM)
// ========================
exports.recordView = async (postId, userId = null) => {

    // logged-in user → count only once per hour
    if (userId) {

        const oneHourAgo = new Date(Date.now() - 3600 * 1000);

        const existing = await PostView.findOne({
            postId,
            userId,
            createdAt: { $gt: oneHourAgo }
        });

        if (existing) return { counted: false };

        await PostView.create({ postId, userId });

        await Post.updateOne(
            { _id: postId },
            { $inc: { "stats.viewCount": 1 } }
        );

        return { counted: true };
    }

    // anonymous user → always count
    await PostView.create({ postId });

    await Post.updateOne(
        { _id: postId },
        { $inc: { "stats.viewCount": 1 } }
    );

    return { counted: true };
};