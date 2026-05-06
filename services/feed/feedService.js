const Post = require("../../models/feed/Post");
const Interaction = require("../../models/feed/Interactions");


// =====================
// CORE FETCH FUNCTION
// =====================
// async function fetchPosts(query, userId, cursor, limit = 20) {

//     if (cursor) {
//         query.createdAt = { $lt: new Date(cursor) };
//     }

//     const posts = await Post.find(query)
//         .sort({ createdAt: -1 })
//         .limit(limit)
//         .select("authorId type createdAt feed images stats")
//         .populate("authorId", "name verified _id handle avatar")
//         .lean();
//     console.log(posts);

//     if (!userId || posts.length === 0) return posts;

//     const ids = posts.map(p => p._id);

//     const interactions = await Interaction.find({
//         userId,
//         postId: { $in: ids }
//     }).lean();

//     const map = {};

//     interactions.forEach(i => {
//         if (!map[i.postId]) map[i.postId] = {};
//         map[i.postId][i.type] = i.value ?? true;
//     });

//     posts.forEach(p => {
//         p.viewerState = {
//             liked: !!map[p._id]?.likePost,
//             saved: !!map[p._id]?.savePost,
//             vote: map[p._id]?.votePost ?? 0
//         };
//     });

//     // return posts;
//     return {
//         posts,
//         nextCursor: posts.length ? posts[posts.length - 1].createdAt : null,
//         hasMore: posts.length === limit
//     };
// }

async function fetchPosts(query, userId, cursor, limit = 20) {
    if (cursor && !isNaN(new Date(cursor))) {
        query.createdAt = { $lt: new Date(cursor) };
    }

    const posts = await Post.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .select("authorId type createdAt feed images stats taggedUsers")
        .populate("authorId", "name verified _id handle avatar")
        .populate("taggedUsers", "name verified _id handle avatar")
        .lean();

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    if (!userId || posts.length === 0) {
        return {
            posts,
            nextCursor: posts.length ? posts[posts.length - 1].createdAt : null,
            hasMore
        };
    }

    const ids = posts.map(p => p._id);

    const interactions = await Interaction.find({
        userId,
        postId: { $in: ids }
    }).lean();

    const map = {};

    interactions.forEach(i => {
        if (!map[i.postId]) map[i.postId] = {};
        map[i.postId][i.type] = i.value ?? true;
    });

    posts.forEach(p => {
        p.viewerState = {
            liked: !!map[p._id]?.likePost,
            saved: !!map[p._id]?.savePost,
            vote: map[p._id]?.votePost ?? 0
        };
    });

    // Check if viewer follows authors
    const authorIds = [...new Set(posts.map(p => p.authorId?._id))].filter(Boolean);
    if (authorIds.length > 0) {
        const Follow = require("../../models/Follow");
        const follows = await Follow.find({
            followerId: userId,
            followingId: { $in: authorIds }
        }).lean();

        const followingMap = {};
        follows.forEach(f => {
            followingMap[f.followingId.toString()] = true;
        });

        posts.forEach(p => {
            if (p.authorId) {
                p.viewerState.followingAuthor = !!followingMap[p.authorId._id.toString()];
            }
        });
    }


    return {
        posts,
        nextCursor: posts.length ? posts[posts.length - 1].createdAt : null,
        hasMore
    };
}

exports.getFeed = async (userId, cursor) => {
    return fetchPosts(
        { status: "published", visibility: "public" },
        userId,
        cursor
    );
};

exports.getGuides = async (userId, cursor) => {
    return fetchPosts(
        { status: "published", visibility: "public", type: "guide" },
        userId,
        cursor
    );
};

exports.getNews = async (userId, cursor) => {
    return fetchPosts(
        { status: "published", visibility: "public", type: "news" },
        userId,
        cursor
    );
};

exports.getSavedPosts = async (userId, cursor, limit = 20) => {
    // Get all saved post IDs for this user
    const query = { userId, type: "savePost" };
    if (cursor && !isNaN(new Date(cursor))) {
        query.createdAt = { $lt: new Date(cursor) };
    }

    const savedInteractions = await Interaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = savedInteractions.length > limit;
    if (hasMore) savedInteractions.pop();

    if (savedInteractions.length === 0) {
        return { posts: [], nextCursor: null, hasMore: false };
    }

    const postIds = savedInteractions.map(i => i.postId);

    const posts = await Post.find({ _id: { $in: postIds } })
        .select("authorId type createdAt feed images stats taggedUsers")
        .populate("authorId", "name verified _id handle avatar")
        .populate("taggedUsers", "name verified _id handle avatar")
        .lean();

    // Maintain the saved-order (newest saved first)
    const postMap = {};
    posts.forEach(p => { postMap[p._id.toString()] = p; });

    const orderedPosts = postIds
        .map(id => postMap[id.toString()])
        .filter(Boolean);

    // Attach viewerState
    const allInteractions = await Interaction.find({
        userId,
        postId: { $in: postIds }
    }).lean();

    const map = {};
    allInteractions.forEach(i => {
        if (!map[i.postId]) map[i.postId] = {};
        map[i.postId][i.type] = i.value ?? true;
    });

    orderedPosts.forEach(p => {
        p.viewerState = {
            liked: !!map[p._id]?.likePost,
            saved: !!map[p._id]?.savePost,
            vote: map[p._id]?.votePost ?? 0
        };
    });

    return {
        posts: orderedPosts,
        nextCursor: savedInteractions.length ? savedInteractions[savedInteractions.length - 1].createdAt : null,
        hasMore
    };
};

exports.getUserPosts = async (authorId, viewerId, cursor) => {
    return fetchPosts(
        { authorId, status: "published", visibility: "public" },
        viewerId,
        cursor
    );
};