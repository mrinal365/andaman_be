// socket/socket.js
const { messageService } = require("../services/chat/messageService");
const { setIO } = require("./socketInstance");
const User = require("../models/User");

module.exports = (io) => {

    // 🔥 SET IO INSTANCE FOR NOTIFICATIONS
    setIO(io);

    const onlineUsers = new Map(); // userId -> Set(socketIds)

    // 🔥 HANDLE SOCKET CONNECTION
    io.on("connection", (socket) => {
        console.log("User connected:----", socket.id);

        // 🔥 REGISTER USER (Online Status)
        socket.on("register_user", async (userId) => {
            if (!userId) return;

            try {
                // If socket was previously registered to a different user, clean up
                if (socket.userId && socket.userId !== userId) {
                    const oldUserId = socket.userId;
                    const oldSockets = onlineUsers.get(oldUserId);
                    if (oldSockets) {
                        oldSockets.delete(socket.id);
                        if (oldSockets.size === 0) {
                            onlineUsers.delete(oldUserId);
                            await User.findByIdAndUpdate(oldUserId, { isOnline: false, lastSeen: new Date() });
                            io.emit("user_offline", { userId: oldUserId, lastSeen: new Date() });
                        }
                    }
                }
                
                socket.userId = userId;
                const existingSockets = onlineUsers.get(userId);
                
                if (!existingSockets || existingSockets.size === 0) {
                    if (!existingSockets) {
                        onlineUsers.set(userId, new Set());
                    }
                    // Update DB
                    await User.findByIdAndUpdate(userId, { isOnline: true });
                    // First socket for this user -> they just came online
                    io.emit("user_online", { userId });
                }
                onlineUsers.get(userId).add(socket.id);


                
                // Join personal room automatically
                socket.join(`user:${userId}`);
                
                // Send current online users list back to the user
                const activeOnlineUsers = Array.from(onlineUsers.entries())
                    .filter(([_, sockets]) => sockets.size > 0)
                    .map(([userId, _]) => userId);
                
                socket.emit("online_users_list", activeOnlineUsers);

            } catch (err) {
                console.error("register_user error:", err);
            }
        });

        // 🔔 JOIN PERSONAL USER ROOM (for notifications)
        socket.on("join_user_room", (userId) => {
            socket.join(`user:${userId}`);
            console.log(`Socket ${socket.id} joined user room: user:${userId}`);
        });

        // 🔥 JOIN SINGLE CONVERSATION
        socket.on("join_conversation", (conversationId) => {
            if (conversationId) {
                const room = conversationId.toString();
                socket.join(room);
                console.log(`[Socket] ${socket.id} joined conversation: ${room}`);
            }
        });

        // 🔥 JOIN MULTIPLE CONVERSATIONS (better UX)
        socket.on("join_multiple", (conversationIds) => {
            if (!Array.isArray(conversationIds)) return;
            conversationIds.forEach((id) => {
                const room = id.toString();
                socket.join(room);
                console.log(`[Socket] ${socket.id} joined conversation: ${room}`);
            });
        });

        // 🔥 SEND MESSAGE VIA SOCKET
        socket.on("send_message", async (data) => {
            try {
                console.log("[Socket] Received send_message:", data);
                // If the frontend emits via socket instead of HTTP, we handle it here
                const message = await messageService.sendMessage({
                    ...data,
                    io
                });
            } catch (err) {
                console.error("send_message socket error:", err);
            }
        });

        // 🔥 TYPING INDICATORS
        socket.on("typing_start", ({ conversationId, userId }) => {
            console.log(`[Socket] Typing start: ${userId} in ${conversationId}`);
            socket.to(conversationId.toString()).emit("user_typing", { conversationId, userId });
        });

        socket.on("typing_end", ({ conversationId, userId }) => {
            socket.to(conversationId.toString()).emit("user_stopped_typing", { conversationId, userId });
        });

        // 🔥 SEEN STATUS
        socket.on("mark_seen", async ({ conversationId, userId }) => {
            try {
                const conversationService = require("../services/chat/conversationService");
                await conversationService.markAsRead(userId, conversationId);
                socket.to(conversationId.toString()).emit("messages_seen", {
                    conversationId,
                    userId,
                    lastReadAt: new Date()
                });
            } catch (err) {
                console.error("mark_seen error:", err);
            }
        });

        // 🔥 LOGOUT (Immediate Offline)
        socket.on("logout_user", async () => {
            const userId = socket.userId;
            if (!userId) return;

            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    onlineUsers.delete(userId);
                    try {
                        const now = new Date();
                        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: now });
                        io.emit("user_offline", { userId, lastSeen: now });
                    } catch (err) {
                        console.error("Logout update error:", err);
                    }
                }
            }
        });

        // 🔥 DISCONNECT

        socket.on("disconnect", async () => {
            const userId = socket.userId;
            if (!userId) return;

            console.log("User disconnected:", socket.id);
            
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                
                // ⏳ Add a small delay before marking offline to handle refreshes
                setTimeout(async () => {
                    const currentSockets = onlineUsers.get(userId);
                    if (!currentSockets || currentSockets.size === 0) {
                        onlineUsers.delete(userId);
                        try {
                            const now = new Date();
                            await User.findByIdAndUpdate(userId, { 
                                isOnline: false, 
                                lastSeen: now 
                            });
                            io.emit("user_offline", {
                                userId: userId,
                                lastSeen: now
                            });
                        } catch (err) {
                            console.error("Offline update error:", err);
                        }
                    }
                }, 3000); // 3 second grace period for page refreshes
            }
        });
    });
};