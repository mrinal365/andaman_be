// const feedService = require("../services/feed/feedService");

// exports.getFeed = async (req, res, next) => {
//     try {
//         const cursor = req.query.cursor;
//         const userId = req.user?._id;

//         const data = await feedService.getFeed(userId, cursor);

//         res.json(data);
//     } catch (err) {
//         next(err);
//     }
// };

const service = require("../services/feed/feedService");

exports.getFeed = async (req, res, next) => {
    try {
        const data = await service.getFeed(
            req.user?._id,
            req.query.cursor
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.getGuides = async (req, res, next) => {
    try {
        const data = await service.getGuides(
            req.user?._id,
            req.query.cursor
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.getNews = async (req, res, next) => {
    try {
        const data = await service.getNews(
            req.user?._id,
            req.query.cursor
        );
        res.json(data);
    } catch (e) { next(e); }
};

exports.getSavedPosts = async (req, res, next) => {
    try {
        const data = await service.getSavedPosts(
            req.user._id,
            req.query.cursor
        );
        res.json(data);
    } catch (e) { next(e); }
};