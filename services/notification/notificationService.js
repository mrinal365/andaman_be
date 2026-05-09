const Notification = require('../../models/Notification');
const notificationConfig = require('../../config/notificationConfig');
const { getIO } = require('../../socket/socketInstance');

// Determine which channels to deliver to based on global + per-event config
const resolveChannels = (type) => {
    const global = notificationConfig.channels;
    const perEvent = notificationConfig.events[type] || {};
    return Object.keys(global).filter((ch) => global[ch] && perEvent[ch]);
};

// ─── Channel Deliverers ──────────────────────────────────────────────────────

const deliverInApp = (notification) => {
    const io = getIO();
    if (!io) return;
    io.to(`user:${notification.recipient.toString()}`).emit('notification', {
        _id:       notification._id,
        type:      notification.type,
        title:     notification.title,
        body:      notification.body,
        data:      notification.data,
        read:      notification.read,
        sender:    notification.sender,
        createdAt: notification.createdAt,
    });
};

const deliverPush = (notification) => {
    console.log(`[Push] Not configured — skipping push for user ${notification.recipient}`);
};

const deliverEmail = (notification) => {
    console.log(`[Email] Not configured — skipping email for user ${notification.recipient}`);
};

const channelDeliverers = { inapp: deliverInApp, push: deliverPush, email: deliverEmail };

// ─── Public API ──────────────────────────────────────────────────────────────

exports.send = async ({ recipient, sender, type, title, body, data = {} }) => {
    try {
        // Skip self-notifications
        if (sender && recipient.toString() === sender.toString()) return;

        const channels = resolveChannels(type);
        if (!channels.length) return;

        const notification = await Notification.create({
            recipient, sender, type, title, body, data, channels
        });

        // Populate sender for real-time delivery
        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'name avatar handle verified')
            .lean();

        // Deliver non-blocking
        channels.forEach((ch) => {
            const fn = channelDeliverers[ch];
            if (fn) fn(populatedNotification);
        });

        return notification;
    } catch (err) {
        console.error('[NotificationService] send error:', err.message);
    }
};

exports.getForUser = async (userId, { page = 1, limit = 20 } = {}) => {
    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount, uniqueConvos] = await Promise.all([
        Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('sender', 'name avatar handle verified')
            .lean(),
        Notification.countDocuments({ recipient: userId }),
        Notification.countDocuments({ recipient: userId, read: false, type: { $ne: 'message' } }),
        Notification.distinct('data.conversationId', { recipient: userId, read: false, type: 'message' }),
    ]);

    return {
        notifications,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            hasMore: skip + notifications.length < total,
        },
        unreadCount: unreadCount,
        unreadMessages: new Set(uniqueConvos.filter(Boolean).map(id => id.toString())).size,
        unreadConversationIds: Array.from(new Set(uniqueConvos.filter(Boolean).map(id => id.toString()))),
    };
};

exports.markRead = async (notificationId, userId) => {
    return Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { read: true, readAt: new Date() },
        { new: true }
    );
};

exports.markAllRead = async (userId) => {
    await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true, readAt: new Date() }
    );
    return { success: true };
};

exports.markMultipleRead = async (notificationIds, userId) => {
    await Notification.updateMany(
        { _id: { $in: notificationIds }, recipient: userId, read: false },
        { read: true, readAt: new Date() }
    );
    return { success: true };
};


exports.getUnreadCount = async (userId) => {
    const [unreadCount, uniqueConvos] = await Promise.all([
        Notification.countDocuments({ recipient: userId, read: false, type: { $ne: 'message' } }),
        Notification.distinct('data.conversationId', { recipient: userId, read: false, type: 'message' })
    ]);

    const unreadConversationIds = Array.from(new Set(uniqueConvos.filter(Boolean).map(id => id.toString())));

    return {
        unreadCount,
        unreadMessages: unreadConversationIds.length,
        unreadConversationIds
    };
};

exports.deleteOne = async (notificationId, userId) => {
    return Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
};
