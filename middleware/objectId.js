// const mongoose = require("mongoose");

// module.exports = param => (req, res, next) => {
//     if (!mongoose.isValidObjectId(req.params[param])) {
//         return res.status(400).json({ error: "Invalid ID" });
//     }
//     next();
// };


const mongoose = require("mongoose");

module.exports = (param) => (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[param])) {
        return res.status(400).json({ error: "Invalid ID" });
    }
    next();
};