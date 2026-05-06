const service = require("../services/feed/storyService");

exports.createStory = async (req, res, next) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) throw new Error("Image URL is required");
        
        const data = await service.createStory(req.user._id, imageUrl);
        res.json(data);
    } catch (e) { next(e); }
};

exports.getStoryFeed = async (req, res, next) => {
    try {
        const data = await service.getStoryFeed(req.user?._id);
        res.json(data);
    } catch (e) { next(e); }
};

exports.likeStory = async (req, res, next) => {
    try {
        const data = await service.likeUnlikeStory(req.params.id, req.user._id);
        res.json(data);
    } catch (e) { next(e); }
};

exports.viewStory = async (req, res, next) => {
    try {
        const data = await service.recordStoryView(req.params.id, req.user._id);
        res.json(data);
    } catch (e) { next(e); }
};

exports.getStoryLikes = async (req, res, next) => {
    try {
        const data = await service.getStoryLikes(req.params.id);
        res.json(data);
    } catch (e) { next(e); }
};

exports.getStoryViews = async (req, res, next) => {
    try {
        const data = await service.getStoryViews(req.params.id);
        res.json(data);
    } catch (e) { next(e); }
};
