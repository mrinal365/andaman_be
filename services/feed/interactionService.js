const Interaction = require("../../models/feed/Interactions");
const Post = require("../../models/feed/Post");
const Comment = require("../../models/feed/Comment");
const notificationService = require("../notification/notificationService");

// ========================
// LIKE / UNLIKE POST
// ========================
exports.togglePostLike = async (postId, userId) => {
  const existing = await Interaction.findOne({ userId, postId, type: "likePost" });

  if (existing) {
    await Interaction.deleteOne({ _id: existing._id });
    await Post.updateOne({ _id: postId }, { $inc: { "stats.likeCount": -1 } });
    return { liked: false };
  } else {
    await Interaction.create({ userId, postId, type: "likePost" });
    await Post.updateOne({ _id: postId }, { $inc: { "stats.likeCount": 1 } });

    // 🔔 Notify post author
    const post = await Post.findById(postId).select("authorId").lean();
    if (post?.authorId) {
      notificationService.send({
        recipient: post.authorId,
        sender: userId,
        type: "likePost",
        title: "New Like!",
        body: `liked your post. See who else is reacting!`,
        data: { postId },
      });
    }

    return { liked: true };
  }
};

// ========================
// LIKE / UNLIKE COMMENT
// ========================
exports.toggleCommentLike = async (commentId, userId) => {
  const existing = await Interaction.findOne({ userId, commentId, type: "likeComment" });

  if (existing) {
    await Interaction.deleteOne({ _id: existing._id });
    await Comment.updateOne({ _id: commentId }, { $inc: { "stats.likeCount": -1 } });
    return { liked: false };
  } else {
    await Interaction.create({ userId, commentId, type: "likeComment" });
    await Comment.updateOne({ _id: commentId }, { $inc: { "stats.likeCount": 1 } });

    // 🔔 Notify comment author
    const comment = await Comment.findById(commentId).select("authorId postId").lean();
    if (comment?.authorId) {
      notificationService.send({
        recipient: comment.authorId,
        sender: userId,
        type: "likeComment",
        title: "Comment Liked!",
        body: `liked your comment: "${comment.text.slice(0, 30)}..."`,
        data: { commentId, postId: comment.postId },
      });
    }

    return { liked: true };
  }
};

// ========================
// SAVE / UNSAVE POST
// ========================
exports.toggleSavePost = async (postId, userId) => {
  const existing = await Interaction.findOne({ userId, postId, type: "savePost" });

  if (existing) {
    await Interaction.deleteOne({ _id: existing._id });
    await Post.updateOne({ _id: postId }, { $inc: { "stats.saveCount": -1 } });
    return { saved: false };
  } else {
    await Interaction.create({ userId, postId, type: "savePost" });
    await Post.updateOne({ _id: postId }, { $inc: { "stats.saveCount": 1 } });
    return { saved: true };
  }
};

// ========================
// VOTE POST (UP/DOWN)
// ========================
exports.votePost = async (postId, userId, value) => {
  const existing = await Interaction.findOne({ userId, postId, type: "votePost" });

  if (existing) {
    if (existing.value === value) {
      await Interaction.deleteOne({ _id: existing._id });
      const updateField = value === 1 ? "stats.upvoteCount" : "stats.downvoteCount";
      await Post.updateOne({ _id: postId }, { $inc: { [updateField]: -1 } });
      return { vote: 0 };
    } else {
      existing.value = value;
      await existing.save();
      const inc = value === 1
        ? { "stats.upvoteCount": 1, "stats.downvoteCount": -1 }
        : { "stats.upvoteCount": -1, "stats.downvoteCount": 1 };
      await Post.updateOne({ _id: postId }, { $inc: inc });
      return { vote: value };
    }
  } else {
    await Interaction.create({ userId, postId, type: "votePost", value });
    const updateField = value === 1 ? "stats.upvoteCount" : "stats.downvoteCount";
    await Post.updateOne({ _id: postId }, { $inc: { [updateField]: 1 } });
    return { vote: value };
  }
};

// ========================
// RESHARE POST
// ========================
exports.resharePost = async (postId, userId) => {
  const existing = await Interaction.findOne({ userId, postId, type: "resharePost" });

  if (existing) {
    return { reshared: true, alreadyReshared: true };
  }

  await Interaction.create({ userId, postId, type: "resharePost" });
  await Post.updateOne({ _id: postId }, { $inc: { "stats.reshareCount": 1 } });

  // 🔔 Notify post author
  const post = await Post.findById(postId).select("authorId").lean();
  if (post?.authorId) {
    notificationService.send({
      recipient: post.authorId,
      sender: userId,
      type: "resharePost",
      title: "Post Reshared!",
      body: `shared your post with their network.`,
      data: { postId },
    });
  }

  return { reshared: true };
};

// ========================
// GET POST LIKES (USERS)
// ========================
exports.getPostLikes = async (postId) => {
  const likes = await Interaction.find({ postId, type: "likePost" })
    .populate("userId", "name avatar handle verified")
    .lean();

  return likes.map(l => l.userId).filter(Boolean);
};
