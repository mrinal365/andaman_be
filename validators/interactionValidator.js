// const { z } = require("zod");

// exports.voteSchema = z.object({
//     value: z.number().refine(v => v === 1 || v === -1)
// });


const { z } = require("zod");

exports.voteSchema = z.object({
    value: z.union([z.literal(1), z.literal(-1)])
});