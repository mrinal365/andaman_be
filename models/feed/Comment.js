const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
  likeCount: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 }
}, { _id: false });

const commentSchema = new mongoose.Schema({

  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },

  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  text: {
    type: String,
    required: true
  },

  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    index: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  stats: statsSchema,

  taggedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]

});

commentSchema.index({ postId: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", commentSchema);