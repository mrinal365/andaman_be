const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    postId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        index: true
    },

    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        index: true
    },

    type: {
        type: String,
        required: true,
        enum: [
            "likePost",
            "likeComment",
            "savePost",
            "resharePost",
            "votePost"
        ],
        index: true
    },

    // only used for votePost
    value: {
        type: Number,
        enum: [1, -1],
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }

});

interactionSchema.index(
    { userId: 1, postId: 1, commentId: 1, type: 1 },
    { unique: true }
);

interactionSchema.index({ postId: 1, type: 1 });
interactionSchema.index({ commentId: 1, type: 1 });

module.exports = mongoose.model("Interaction", interactionSchema);