const Comment = require("../../models/feed/Comment");
const Post = require("../../models/feed/Post");
const notificationService = require("../notification/notificationService");


// =======================
// ADD COMMENT TO POST
// =======================
exports.addComment = async (postId, userId, text, taggedUsers = []) => {

    if (!text || !text.trim()) {
        throw new Error("Comment text required");
    }

    const comment = await Comment.create({
        postId,
        authorId: userId,
        text,
        parentCommentId: null,
        taggedUsers
    });

    // increment post comment counter
    await Post.updateOne(
        { _id: postId },
        { $inc: { "stats.commentCount": 1 } }
    );

    // 🔥 populate author
    const populatedComment = await Comment.findById(comment._id)
        .populate("authorId", "name avatar verified")
        .populate("taggedUsers", "name handle avatar verified _id")
        .lean();
    // 🔥 rename authorId → user
    populatedComment.user = populatedComment.authorId;
    delete populatedComment.authorId;

    // 🔔 Notify post author
    const post = await Post.findById(postId).select("authorId").lean();
    if (post?.authorId) {
        notificationService.send({
            recipient: post.authorId,
            sender: userId,
            type: "comment",
            title: "New comment on your post",
            body: text.slice(0, 80),
            data: { postId, commentId: comment._id },
        });
    }

    // 🔔 Notify tagged users
    if (taggedUsers && taggedUsers.length > 0) {
        const author = await require("../../models/User").findById(userId).select("name");
        taggedUsers.forEach(taggedId => {
            notificationService.send({
                recipient: taggedId,
                sender: userId,
                type: "tagComment",
                title: `${author?.name || 'Someone'} tagged you in a comment`,
                body: text.slice(0, 80),
                data: { postId, commentId: comment._id },
            });
        });
    }

    return populatedComment;
};



// =======================
// REPLY TO COMMENT
// =======================
exports.replyComment = async (parentCommentId, userId, text, taggedUsers = []) => {

    if (!text || !text.trim()) {
        throw new Error("Reply text required");
    }

    const parent = await Comment.findById(parentCommentId);

    if (!parent) throw new Error("Parent comment not found");

    const comment = await Comment.create({
        postId: parent.postId,
        authorId: userId,
        text,
        parentCommentId,
        taggedUsers
    });

    // increment parent reply counter
    await Comment.updateOne(
        { _id: parentCommentId },
        { $inc: { "stats.replyCount": 1 } }
    );

    // increment post comment counter
    await Post.updateOne(
        { _id: parent.postId },
        { $inc: { "stats.commentCount": 1 } }
    );

    // 🔥 populate author and rename for consistency
    const populatedReply = await Comment.findById(reply._id)
        .populate("authorId", "name avatar verified _id")
        .populate("taggedUsers", "name handle avatar verified _id")
        .lean();

    populatedReply.user = populatedReply.authorId;
    delete populatedReply.authorId;

    // 🔔 Notify parent comment author
    if (parent?.authorId) {
        notificationService.send({
            recipient: parent.authorId,
            sender: userId,
            type: "reply",
            title: "Someone replied to your comment",
            body: text.slice(0, 80),
            data: { postId: parent.postId, commentId: parentCommentId, replyId: reply._id },
        });
    }

    // 🔔 Notify tagged users
    if (taggedUsers && taggedUsers.length > 0) {
        const author = await require("../../models/User").findById(userId).select("name");
        taggedUsers.forEach(taggedId => {
            notificationService.send({
                recipient: taggedId,
                sender: userId,
                type: "tagComment",
                title: `${author?.name || 'Someone'} tagged you in a reply`,
                body: text.slice(0, 80),
                data: { postId: parent.postId, commentId: parentCommentId, replyId: reply._id },
            });
        });
    }

    return populatedReply;
};




// =======================
// GET COMMENTS WITH REPLIES
// =======================
exports.getPostComments = async (postId, userId = null) => {

    // fetch all comments for post
    const comments = await Comment.find({ postId })
        .populate("authorId", "name avatar verified _id")
        .populate("taggedUsers", "name handle avatar verified _id")
        .sort({ createdAt: 1 })
        .lean();

    // 🔹 If userId provided, fetch likes to mark "isLiked"
    let likedCommentIds = new Set();
    if (userId) {
        const Interaction = require("../../models/feed/Interactions");
        const likes = await Interaction.find({
            userId,
            postId,
            type: "likeComment"
        }).select("commentId");
        likedCommentIds = new Set(likes.map(l => l.commentId.toString()));
    }

    // group replies
    const map = {};
    const roots = [];

    comments.forEach(c => {
        c.replies = [];
        // 🔥 rename authorId → user
        c.user = c.authorId;
        delete c.authorId;

        // 🔹 add viewer state
        c.viewerState = {
            liked: likedCommentIds.has(c._id.toString())
        };

        map[c._id.toString()] = c;
    });

    comments.forEach(c => {
        if (c.parentCommentId) {
            const parent = map[c.parentCommentId.toString()];
            if (parent) parent.replies.push(c);
        } else {
            roots.push(c);
        }
    });

    return roots;
};




// =======================
// DELETE COMMENT (AUTHOR ONLY)
// =======================
exports.deleteComment = async (commentId, userId) => {

    const comment = await Comment.findById(commentId);

    if (!comment) throw new Error("Comment not found");

    if (String(comment.authorId) !== String(userId)) {
        throw new Error("Not allowed");
    }

    // soft delete approach (better for production)
    comment.text = "[deleted]";
    await comment.save();

    return { success: true };
};