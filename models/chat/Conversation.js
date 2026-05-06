// const mongoose = require("mongoose");

// const ConversationSchema = new mongoose.Schema(
// {
//     type: {
//         type: String,
//         enum: ["direct", "group"],
//         required: true
//     },

//     participants: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             index: true
//         }
//     ],

//     name: {
//         type: String,
//         default: null
//     },

//     avatar: {
//         type: String,
//         default: null
//     },

//     createdBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//     },

//     lastMessageId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Message",
//         default: null
//     },

//     lastMessageText: {
//         type: String,
//         default: null
//     },

//     lastMessageSenderId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//     },

//     lastMessageAt: {
//         type: Date,
//         default: null
//     }
// },
// {
//     timestamps: true
// }
// );

// /*
// Indexes
// */

// ConversationSchema.index({ participants: 1 });
// ConversationSchema.index({ lastMessageAt: -1 });

// module.exports = mongoose.model("Conversation", ConversationSchema);




const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["direct", "group"],
            required: true,
        },

        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                index: true, // inline index
            },
        ],

        name: String,
        avatar: String,

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        lastMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },

        lastMessageText: String,

        lastMessageSenderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        lastMessageAt: {
            type: Date,
            index: true, // sorting chats
        },
    },
    { timestamps: true }
);

module.exports.Conversation = mongoose.model(
    "Conversation",
    conversationSchema
);