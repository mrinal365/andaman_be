// // routes/upload.js
// const { protect: auth } = require("../middleware/auth");

// const imagekit = require("../utils/imageKit");

// exports.getUploadAuth = async (req, res, auth) => {
//     const authParams = imagekit.getAuthenticationParameters();

//     res.json(authParams);
// };

// routes/upload.routes.js

const express = require("express");
const router = express.Router();

const { protect: auth } = require("../middleware/auth");
const { getUploadAuth } = require("../controllers/uploadController");

// 🔐 Protected route
router.get("/upload-image", auth, getUploadAuth);

module.exports = router;