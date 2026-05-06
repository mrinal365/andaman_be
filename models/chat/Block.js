const blockSchema = new mongoose.Schema(
    {
        blockerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        blockedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

// unique block pair
blockSchema.index(
    { blockerId: 1, blockedId: 1 },
    { unique: true }
);

module.exports.Block = mongoose.model("Block", blockSchema);

// const mongoose = require("mongoose");

// const BlockSchema = new mongoose.Schema(
//     {
//         blockerId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true
//         },

//         blockedId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true
//         }
//     },
//     {
//         timestamps: true
//     });

// BlockSchema.index(
//     { blockerId: 1, blockedId: 1 },
//     { unique: true }
// );

// module.exports = mongoose.model("Block", BlockSchema);