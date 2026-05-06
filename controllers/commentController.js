const service = require("../services/feed/commentService");

exports.addComment = async (req, res, next) => {
    try {
        const data = await service.addComment(
            req.params.postId,
            req.user._id,
            req.body.text
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.replyComment = async (req, res, next) => {
    try {
        const data = await service.replyComment(
            req.params.commentId,
            req.user._id,
            req.body.text
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.getComments = async (req, res, next) => {
    try {
        const data = await service.getPostComments(
            req.params.postId,
            req.user?._id
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const data = await service.deleteComment(
            req.params.commentId,
            req.user._id
        );
        res.json(data);
    } catch (e) { next(e); }
};