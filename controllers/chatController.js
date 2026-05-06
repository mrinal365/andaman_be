const conversationService = require("../services/chat/conversationService");
const messageService = require("../services/chat/messageService");

// CREATE CONVERSATION
exports.createConversation = async (req, res, next) => {
    try {
        const data = await conversationService.createConversation(
            req.user._id,
            req.body.userId
        );
        res.json(data);
    } catch (e) {
        next(e);
    }
};

// GET CHAT LIST
exports.getConversations = async (req, res, next) => {
    try {
        const data = await conversationService.getConversations(req.user._id);
        res.json(data);
    } catch (e) {
        next(e);
    }
};

// SEND MESSAGE
exports.sendMessage = async (req, res, next) => {
    try {
        const data = await messageService.sendMessage({
            senderId: req.user._id,
            conversationId: req.body.conversationId,
            text: req.body.text,
            media: req.body.media,
            io: req.io,
        });

        res.json(data);
    } catch (e) {
        next(e);
    }
};

// FETCH MESSAGES
exports.getMessages = async (req, res, next) => {
    try {
        const data = await messageService.getMessages({
            userId: req.user._id,
            conversationId: req.query.conversationId,
            cursor: req.query.cursor,
            limit: req.query.limit,
        });

        res.json(data);
    } catch (e) {
        next(e);
    }
};

// MARK AS READ
exports.markAsRead = async (req, res, next) => {
    try {
        const data = await conversationService.markAsRead(
            req.user._id,
            req.body.conversationId
        );

        res.json(data);
    } catch (e) {
        next(e);
    }
};