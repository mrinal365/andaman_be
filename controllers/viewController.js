const service = require("../services/feed/viewService");

exports.recordView = async (req, res, next) => {
    try {

        const userId = req.user?._id || null;

        const data = await service.recordView(
            req.params.postId,
            userId
        );

        res.json(data);

    } catch (e) { next(e); }
};