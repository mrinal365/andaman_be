const { Message } = require("../../models/chat/Message");
const { Conversation } = require("../../models/chat/Conversation");
const { ConversationParticipant } = require("../../models/chat/ConversationParticipant");
const notificationService = require("../notification/notificationService");

// SEND MESSAGE
exports.sendMessage = async ({
    senderId,
    conversationId,
    text,
    media,
    io,
}) => {
    // validate membership
    const exists = await ConversationParticipant.findOne({
        conversationId,
        userId: senderId,
    });

    if (!exists) throw new Error("Not part of conversation");

    // get next sequence (simple version for now)
    const last = await Message.findOne({ conversationId })
        .sort({ messageSequence: -1 })
        .lean();

    const messageSequence = last ? last.messageSequence + 1 : 1;

    const message = await Message.create({
        conversationId,
        senderId,
        text,
        media,
        messageSequence,
    });

    // Populate sender details for the socket emit to match getMessages format
    const populatedMessage = await Message.findById(message._id)
        .populate("senderId", "name avatar")
        .lean();

    // Map to the format frontend expects
    const formattedMessage = {
        id: populatedMessage._id,
        conversationId: populatedMessage.conversationId,
        sender: populatedMessage.senderId,
        text: populatedMessage.text,
        media: populatedMessage.media,
        type: populatedMessage.type,
        sequence: populatedMessage.messageSequence,
        createdAt: populatedMessage.createdAt,
    };

    // Broadcast the message via WebSockets
    const socketIO = io || require("../../socket/socketInstance").getIO();
    if (socketIO) {
        const room = conversationId.toString();
        console.log(`[Socket] Broadcasting receive_message to room: ${room}`);
        socketIO.to(room).emit("receive_message", formattedMessage);
    }

    // update conversation
    await Conversation.updateOne(
        { _id: conversationId },
        {
            lastMessageId: message._id,
            lastMessageText: text || (media ? "📎 Media" : ""),
            lastMessageSenderId: senderId,
            lastMessageAt: new Date(),
        }
    );

    // update unread count
    await ConversationParticipant.updateMany(
        {
            conversationId,
            userId: { $ne: senderId },
        },
        { $inc: { unreadCount: 1 } }
    );

    // 🔔 Notify other participants
    const participants = await ConversationParticipant.find({
        conversationId,
        userId: { $ne: senderId }
    }).lean();

    if (participants.length > 0) {
        participants.forEach(p => {
            notificationService.send({
                recipient: p.userId,
                sender: senderId,
                type: "message",
                title: populatedMessage.senderId.name || "New Message",
                body: text || (media ? "📎 Sent a media" : "New message received"),
                data: { conversationId, messageId: message._id },
            });
        });
    }

    return formattedMessage;

    // const message = await Message.create({
    //     conversationId,
    //     senderId,
    //     text,
    //     media,
    //     messageSequence,
    // });

    // const populatedMessage = await Message.findById(message._id)
    //     .populate("senderId", "name avatar")
    //     .lean();

    // await Conversation.updateOne(
    //     { _id: conversationId },
    //     {
    //         lastMessageId: message._id,
    //         lastMessageText: text || (media ? "📎 Media" : ""),
    //         lastMessageSenderId: senderId,
    //         lastMessageAt: new Date(),
    //     }
    // );

    // await ConversationParticipant.updateMany(
    //     {
    //         conversationId,
    //         userId: { $ne: senderId },
    //     },
    //     { $inc: { unreadCount: 1 } }
    // );

    // return {
    //     id: populatedMessage._id,
    //     conversationId: populatedMessage.conversationId,
    //     sender: populatedMessage.senderId,
    //     text: populatedMessage.text,
    //     media: populatedMessage.media,
    //     type: populatedMessage.type,
    //     sequence: populatedMessage.messageSequence,
    //     createdAt: populatedMessage.createdAt,
    // };
};

// // FETCH MESSAGES
// exports.getMessages = async ({ userId, conversationId, cursor }) => {
//     const query = { conversationId };
//     if (!conversationId) {
//         throw new Error("ConversationId not found");
//     }

//     if (cursor) {
//         query.messageSequence = { $lt: Number(cursor) };
//     }

//     const messages = await Message.find(query)
//         .sort({ messageSequence: -1 })
//         .limit(30)
//         .lean();

//     return messages.reverse();
// };


// FETCH MESSAGES
exports.getMessages = async ({ userId, conversationId, cursor, limit = 10 }) => {
    if (!conversationId) {
        throw new Error("ConversationId not found");
    }

    const query = { conversationId };

    if (cursor) {
        query.messageSequence = { $lt: Number(cursor) };
    }

    const messages = await Message.find(query)
        .populate("senderId", "name avatar")
        .sort({ messageSequence: -1 })
        .limit(Number(limit) + 1) // Fetch one extra to check if there are more
        .lean();

    const hasMore = messages.length > Number(limit);
    const results = hasMore ? messages.slice(0, Number(limit)) : messages;

    // Fetch other participant's lastReadAt to determine seen status
    const { ConversationParticipant } = require("../../models/chat/ConversationParticipant");
    const otherParticipant = await ConversationParticipant.findOne({
        conversationId,
        userId: { $ne: userId }
    }).lean();

    const formattedMessages = results.reverse().map((m) => ({
        id: m._id,
        conversationId: m.conversationId,
        sender: m.senderId,
        text: m.text,
        media: m.media,
        type: m.type,
        sequence: m.messageSequence,
        createdAt: m.createdAt,
        isMine: m.senderId?._id?.toString() === userId.toString(),
    }));

    return {
        messages: formattedMessages,
        hasMore,
        otherUserLastReadAt: otherParticipant ? otherParticipant.lastReadAt : null
    };
};