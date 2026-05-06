const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { protect } = require("../middleware/auth");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", protect, upload.single("image"), async (req, res) => {
    try {
        const file = req.file;

        const result = await cloudinary.uploader.upload_stream(
            {
                folder: "posts",
                resource_type: "image",
            },
            (error, result) => {
                if (error) return res.status(500).json({ error });

                return res.json({
                    url: result.secure_url,
                });
            }
        );

        result.end(file.buffer);
    } catch (err) {
        res.status(500).json({ message: "Upload failed" });
    }
});

module.exports = router;