const mongoose = require("mongoose");

const conversationParticipantSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: ["member", "admin"],
            default: "member",
        },

        unreadCount: {
            type: Number,
            default: 0,
            index: true,
        },

        muted: {
            type: Boolean,
            default: false,
        },

        pinned: {
            type: Boolean,
            default: false,
            index: true,
        },

        lastReadAt: Date,

        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false }
);

// compound unique (must stay separate — Mongo limitation)
conversationParticipantSchema.index(
    { userId: 1, conversationId: 1 },
    { unique: true }
);

module.exports.ConversationParticipant = mongoose.model(
    "ConversationParticipant",
    conversationParticipantSchema
);


// const mongoose = require("mongoose");

// const ConversationParticipantSchema = new mongoose.Schema(
//     {
//         conversationId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Conversation",
//             required: true
//         },

//         userId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true
//         },

//         role: {
//             type: String,
//             enum: ["member", "admin"],
//             default: "member"
//         },

//         unreadCount: {
//             type: Number,
//             default: 0
//         },

//         muted: {
//             type: Boolean,
//             default: false
//         },

//         pinned: {
//             type: Boolean,
//             default: false
//         },

//         lastReadAt: {
//             type: Date,
//             default: null
//         },

//         joinedAt: {
//             type: Date,
//             default: Date.now
//         }
//     });

// /*
// Indexes
// */

// ConversationParticipantSchema.index(
//     { conversationId: 1, userId: 1 },
//     { unique: true }
// );

// ConversationParticipantSchema.index({ userId: 1 });
// ConversationParticipantSchema.index({ userId: 1, pinned: 1 });
// ConversationParticipantSchema.index({ userId: 1, unreadCount: -1 });

// module.exports = mongoose.model(
//     "ConversationParticipant",
//     ConversationParticipantSchema
// );


