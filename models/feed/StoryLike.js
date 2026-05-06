const mongoose = require("mongoose");

const storyLikeSchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only like a story once
storyLikeSchema.index({ storyId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("StoryLike", storyLikeSchema);
