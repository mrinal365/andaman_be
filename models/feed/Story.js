const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours in seconds (automatically deletes from DB)
  },
  stats: {
    likeCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model("Story", storySchema);
