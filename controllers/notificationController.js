const notificationService = require('../services/notification/notificationService');

// GET /api/notifications
exports.getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const data = await notificationService.getForUser(req.user._id, { page, limit });
        res.json(data);
    } catch (err) {
        next(err);
    }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await notificationService.getUnreadCount(req.user._id);
        res.json({ count });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/notifications/:id/read
exports.markRead = async (req, res, next) => {
    try {
        const notification = await notificationService.markRead(req.params.id, req.user._id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (err) {
        next(err);
    }
};

// PATCH /api/notifications/read-all
exports.markAllRead = async (req, res, next) => {
    try {
        const result = await notificationService.markAllRead(req.user._id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

// PATCH /api/notifications/read-multiple
exports.markMultipleRead = async (req, res, next) => {
    try {
        const { notificationIds } = req.body;
        if (!Array.isArray(notificationIds)) {
            return res.status(400).json({ message: 'notificationIds must be an array' });
        }
        const result = await notificationService.markMultipleRead(notificationIds, req.user._id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};


// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
    try {
        await notificationService.deleteOne(req.params.id, req.user._id);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};
