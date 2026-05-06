const Post = require("../../models/feed/Post");
const User = require("../../models/User");
const notificationService = require("../notification/notificationService");


// ======================
// CREATE POST
// ======================
exports.createPost = async (userId, payload) => {

    const { type, content, images = [], taggedUsers = [] } = payload;

    if (!["guide", "news", "update"].includes(type)) {
        throw new Error("Invalid post type");
    }

    // ---- build feed preview automatically ----
    const feed = {
        title: content.title || "",
        previewText:
            content.shortText ||
            content.text?.slice(0, 160) ||
            content.body?.slice(0, 160) ||
            "",
        coverImage: images[0] || null,
        imageCount: images.length
    };

    const post = await Post.create({
        authorId: userId,
        type,
        status: "published",
        visibility: "public",
        createdAt: new Date(),
        images,
        content,
        feed,
        taggedUsers
    });

    // update the user schea also
    await User.findByIdAndUpdate(
        userId,
        { $inc: { "stats.posts": 1 } },
        { new: false }
    );
    // populate author
    // ✅ populate author safely
    await post.populate("authorId", "name avatar verified");
    await post.populate("taggedUsers", "_id name handle avatar verified");

    // 🔔 Notify tagged users
    if (taggedUsers && taggedUsers.length > 0) {
        const author = await User.findById(userId).select("name");
        taggedUsers.forEach(taggedId => {
            notificationService.send({
                recipient: taggedId,
                sender: userId,
                type: "tagPost",
                title: `${author?.name || 'Someone'} tagged you in a post`,
                body: feed.previewText.slice(0, 80),
                data: { postId: post._id },
            });
        });
    }

    const obj = post.toObject();
    obj.author = obj.authorId;
    delete obj.authorId;

    return obj;
};



// ======================
// GET POST BY ID
// ======================
exports.getPostById = async (postId) => {

    const post = await Post.findOne({
        _id: postId,
        status: "published"
    }).populate("authorId", "name verified _id handle avatar")
    .populate("taggedUsers", "name verified _id handle avatar")
    .lean();

    if (!post) throw new Error("Post not found");

    return post;
};



// ======================
// UPDATE POST (AUTHOR ONLY)
// ======================
exports.updatePost = async (postId, userId, payload) => {

    const post = await Post.findById(postId);

    if (!post) throw new Error("Post not found");

    if (String(post.authorId) !== String(userId)) {
        throw new Error("Not allowed");
    }

    if (payload.content) {
        post.content = payload.content;

        // rebuild feed preview
        post.feed.previewText =
            payload.content.shortText ||
            payload.content.text?.slice(0, 160) ||
            payload.content.body?.slice(0, 160) ||
            "";
    }

    if (payload.images) {
        post.images = payload.images;
        post.feed.coverImage = payload.images[0] || null;
        post.feed.imageCount = payload.images.length;
    }

    post.updatedAt = new Date();

    await post.save();

    return post;
};



// ======================
// DELETE POST (SOFT DELETE)
// ======================
exports.deletePost = async (postId, userId) => {

    const post = await Post.findById(postId);

    if (!post) throw new Error("Post not found");

    if (String(post.authorId) !== String(userId)) {
        throw new Error("Not allowed");
    }

    // Prevent double decrement
    if (post.status !== "deleted") {
        post.status = "deleted";
        await post.save();

        // 🔥 decrement post count atomically
        await User.findByIdAndUpdate(
            userId,
            { $inc: { "stats.posts": -1 } }
        );
    }

    return { success: true };
};