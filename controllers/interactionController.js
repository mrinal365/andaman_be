const service = require("../services/feed/interactionService");

exports.likePost = async (req, res, next) => {
    try {
        const data = await service.togglePostLike(
            req.params.postId,
            req.user._id
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.likeComment = async (req, res, next) => {
    try {
        const data = await service.toggleCommentLike(
            req.params.commentId,
            req.user._id
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.savePost = async (req, res, next) => {
    try {
        const data = await service.toggleSavePost(
            req.params.postId,
            req.user._id
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.votePost = async (req, res, next) => {
    try {
        const data = await service.votePost(
            req.params.postId,
            req.user._id,
            Number(req.body.value)
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.resharePost = async (req, res, next) => {
    try {
        const data = await service.resharePost(
            req.params.postId,
            req.user._id
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.getPostLikes = async (req, res, next) => {
    try {
        const Post = require("../models/feed/Post");
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only authors can see likes" });
        }
        const likes = await service.getPostLikes(req.params.postId);
        res.json(likes);
    } catch (e) { next(e); }
};