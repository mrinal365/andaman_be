const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema({
  title: String,
  previewText: String,
  coverImage: String,
  imageCount: Number
}, { _id: false });

const contentSchema = new mongoose.Schema({
  title: String,
  body: String,      // guide
  text: String,      // news
  shortText: {
    type: String,
    maxlength: 700
  }
}, { _id: false });

const statsSchema = new mongoose.Schema({
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  relevancyScore: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  reshareCount: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 }
}, { _id: false });

const postSchema = new mongoose.Schema({

  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: ["guide", "news", "update"],
    required: true,
    index: true
  },

  status: {
    type: String,
    enum: ["published", "draft", "deleted"],
    default: "draft",
    index: true
  },

  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public",
    index: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: Date,

  feed: feedSchema,

  images: [String],

  content: contentSchema,

  stats: statsSchema

});

postSchema.index({ status: 1, visibility: 1, createdAt: -1 });

postSchema.index({
  status: 1,
  visibility: 1,
  "stats.relevancyScore": -1,
  createdAt: -1
});

module.exports = mongoose.model("Post", postSchema);