const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    type: {
        type: String,
        enum: ['likePost', 'likeComment', 'comment', 'reply', 'follow', 'resharePost', 'message', 'tagPost', 'tagComment'],
        required: true
    },
    title:    { type: String },
    body:     { type: String },
    data:     { type: mongoose.Schema.Types.Mixed, default: {} },
    channels: { type: [String], default: ['inapp'] },
    read:     { type: Boolean, default: false, index: true },
    readAt:   { type: Date, default: null }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
