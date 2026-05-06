
const imagekit = require("../utils/imageKit");

exports.getUploadAuth = async (req, res, next) => {
    try {
        const authParams = imagekit.getAuthenticationParameters();

        res.json(authParams);
    } catch (err) {
        next(err);
    }
};