// const { z } = require("zod");

// exports.createPostSchema = z.object({

//     type: z.enum(["guide", "news", "update"]),

//     content: z.object({
//         title: z.string().max(200).optional(),
//         body: z.string().max(20000).optional(),
//         text: z.string().max(5000).optional(),
//         shortText: z.string().max(700).optional()
//     }),

//     images: z.array(z.string().url()).max(10).optional()

// });


const { z } = require("zod");

/* ---------------- COMMON ---------------- */

const images = z.array(z.string().min(1)).max(10).optional();


/* ---------------- GUIDE ---------------- */

const guideContent = z.object({
    title: z.string().min(3).max(200),
    body: z.string().min(50).max(50000)   // guides should be long
});

exports.createGuideSchema = z.object({
    type: z.literal("guide"),
    content: guideContent,
    images
});


/* ---------------- NEWS ---------------- */

const newsContent = z.object({
    title: z.string().min(3).max(200),
    text: z.string().min(20).max(10000)
});

exports.createNewsSchema = z.object({
    type: z.literal("news"),
    content: newsContent,
    images
});


/* ---------------- UPDATE ---------------- */

const updateContent = z.object({
    shortText: z.string().min(1).max(700)
});

exports.createUpdateSchema = z.object({
    type: z.literal("update"),
    content: updateContent,
    images
});


/* ---------------- COMBINED CREATE ---------------- */

exports.createPostSchema = z.discriminatedUnion("type", [
    exports.createGuideSchema,
    exports.createNewsSchema,
    exports.createUpdateSchema
]);


/* ---------------- UPDATE POST ---------------- */

exports.updatePostSchema = z.object({
    content: z.object({
        title: z.string().min(3).max(200).optional(),
        body: z.string().min(50).max(50000).optional(),
        text: z.string().min(20).max(10000).optional(),
        shortText: z.string().min(1).max(700).optional()
    }).optional(),

    images: images
}).refine(
    data => data.content || data.images,
    { message: "Nothing to update" }
);