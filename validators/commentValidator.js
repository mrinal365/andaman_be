// const { z } = require("zod");

// exports.commentSchema = z.object({
//     text: z.string().min(1).max(1000)
// });

const { z } = require("zod");

exports.commentSchema = z.object({
    text: z.string().trim().min(1).max(1000)
});