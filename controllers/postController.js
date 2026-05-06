const service = require("../services/feed/postService");

exports.createPost = async (req, res, next) => {
    try {
        const data = await service.createPost(
            req.user._id,
            req.body
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.getPost = async (req, res, next) => {
    try {
        const data = await service.getPostById(
            req.params.postId,
            req.user?._id
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.updatePost = async (req, res, next) => {
    try {
        const data = await service.updatePost(
            req.params.postId,
            req.user._id,
            req.body
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.deletePost = async (req, res, next) => {
    try {
        const data = await service.deletePost(
            req.params.postId,
            req.user._id
        );
        res.json(data);
    } catch (e) { next(e); }
};