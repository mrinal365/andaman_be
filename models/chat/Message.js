const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: ["text", "image", "video", "file", "system"],
            default: "text",
        },

        text: String,

        media: [
            {
                url: String,
                type: {
                    type: String,
                    enum: ["image", "video", "file"],
                },
                thumbnail: String, // optional (for images/videos)
                size: Number, // optional (bytes)
            },
        ],

        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },

        messageSequence: {
            type: Number,
            required: true,
            index: true,
        },

        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },

        updatedAt: {
            type: Date,
            default: Date.now,
        },
    }
);

// compound index for pagination (must be separate)
messageSchema.index({ conversationId: 1, messageSequence: -1 });

module.exports.Message = mongoose.model("Message", messageSchema);




// const mongoose = require("mongoose");

// const MessageSchema = new mongoose.Schema(
//     {
//         conversationId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Conversation",
//             required: true,
//             index: true
//         },

//         senderId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true
//         },

//         type: {
//             type: String,
//             enum: ["text", "image", "video", "file", "system"],
//             default: "text"
//         },

//         text: {
//             type: String,
//             default: null
//         },

//         mediaUrl: {
//             type: String,
//             default: null
//         },

//         replyTo: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Message",
//             default: null
//         },

//         messageSequence: {
//             type: Number,
//             required: true
//         },

//         deletedFor: [
//             {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: "User"
//             }
//         ]
//     },
//     {
//         timestamps: true
//     });

// /*
// Indexes
// */

// MessageSchema.index({ conversationId: 1, createdAt: -1 });
// MessageSchema.index({ conversationId: 1, messageSequence: -1 });

// module.exports = mongoose.model("Message", MessageSchema);