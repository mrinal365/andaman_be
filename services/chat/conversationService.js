const { Conversation } = require("../../models/chat/Conversation");
const { ConversationParticipant } = require("../../models/chat/ConversationParticipant");

// CREATE DIRECT CHAT
exports.createConversation = async (userId, otherUserId) => {
    // check existing
    const existing = await Conversation.findOne({
        type: "direct",
        participants: { $all: [userId, otherUserId] },
        $expr: { $eq: [{ $size: "$participants" }, 2] }
    });
    if (existing) return existing;

    const conversation = await Conversation.create({
        type: "direct",
        participants: [userId, otherUserId],
        createdBy: userId,
    });

    await ConversationParticipant.insertMany([
        { conversationId: conversation._id, userId },
        { conversationId: conversation._id, userId: otherUserId },
    ]);

    return conversation;
};

// GET CHAT LIST
// exports.getConversations = async (userId) => {
//     const participants = await ConversationParticipant.find({ userId })
//         .populate("conversationId")
//         .sort({ "conversationId.lastMessageAt": -1 })
//         .lean();

//     return participants.map((p) => ({
//         conversationId: p.conversationId._id,
//         lastMessage: p.conversationId.lastMessageText,
//         lastMessageTime: p.conversationId.lastMessageAt,
//         unreadCount: p.unreadCount,
//     }));
// };
exports.getConversations = async (userId) => {
    const Follow = require("../../models/Follow");
    const participants = await ConversationParticipant.find({ userId })
        .populate({
            path: "conversationId",
            populate: {
                path: "participants",
                select: "name avatar handle lastSeen"
            }

        })
        .sort({ "conversationId.lastMessageAt": -1 })
        .lean();

    const followings = await Follow.find({ followerId: userId }).lean();
    const followers = await Follow.find({ followingId: userId }).lean();
    
    const followingIds = new Set(followings.map(f => f.followingId.toString()));
    const followerIds = new Set(followers.map(f => f.followerId.toString()));

    return participants.map((p) => {
        const convo = p.conversationId;

        // fallback safety
        if (!convo) return null;

        let name = convo.name;
        let avatar = convo.avatar;
        let handle = "";
        let otherUserId = null;
        let otherUser = null;

        // 🔹 Direct chat → get other user
        if (convo.type === "direct") {
            otherUser = convo.participants.find(
                (u) => u._id && u._id.toString() !== userId.toString()
            );

            name = otherUser?.name || "Unknown User";
            avatar = otherUser?.avatar || null;
            handle = otherUser?.handle || "";
            otherUserId = otherUser?._id;
        }


        const otherUserIdStr = otherUserId?.toString();

        return {
            conversationId: convo._id,
            type: convo.type,
            name,
            avatar,
            handle,
            otherUserId: otherUserId?.toString() || null,
            lastSeen: otherUser?.lastSeen || null,

            isFollowing: otherUserIdStr ? followingIds.has(otherUserIdStr) : false,
            isFollower: otherUserIdStr ? followerIds.has(otherUserIdStr) : false,
            lastMessage: convo.lastMessageText || "",
            lastMessageAt: convo.lastMessageAt,
            createdAt: convo.createdAt,
            unreadCount: p.unreadCount || 0,
        };

    })
    .filter(Boolean)
    .filter(item => {
        // Only show if it has a last message OR if the other user is followed
        return !!item.lastMessage || item.isFollowing;
    });
};



// MARK AS READ
exports.markAsRead = async (userId, conversationId) => {
    const Notification = require("../../models/Notification");
    const mongoose = require("mongoose");

    const convoIdStr = conversationId.toString();
    const convoIdObj = mongoose.Types.ObjectId.isValid(convoIdStr) 
        ? new mongoose.Types.ObjectId(convoIdStr) 
        : null;

    const query = { 
        recipient: userId, 
        type: 'message', 
        read: false,
        $or: [
            { 'data.conversationId': convoIdStr },
            { 'data.conversationId': convoIdObj }
        ].filter(q => q['data.conversationId'] !== null)
    };

    await Promise.all([
        ConversationParticipant.updateOne(
            { userId, conversationId },
            {
                lastReadAt: new Date(),
                unreadCount: 0,
            }
        ),
        Notification.updateMany(
            query,
            { 
                read: true, 
                readAt: new Date() 
            }
        )
    ]);

    return { success: true };
};