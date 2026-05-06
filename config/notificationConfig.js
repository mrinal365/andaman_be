module.exports = {
    channels: {
        inapp: true,
        push:  false,
        email: false,
    },
    events: {
        likePost:    { inapp: true,  push: true,  email: false },
        likeComment: { inapp: true,  push: false, email: false },
        comment:     { inapp: true,  push: true,  email: true  },
        reply:       { inapp: true,  push: true,  email: true  },
        follow:      { inapp: true,  push: true,  email: false },
        resharePost: { inapp: true,  push: false, email: false },
        message:     { inapp: true,  push: true,  email: false },
    }
};
