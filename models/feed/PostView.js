const mongoose = require("mongoose");

const postViewSchema = new mongoose.Schema({

    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        index: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }

});

// Optional TTL cleanup example:
// postViewSchema.index({ createdAt:1 }, { expireAfterSeconds: 90*24*3600 });

module.exports = mongoose.model("PostView", postViewSchema);