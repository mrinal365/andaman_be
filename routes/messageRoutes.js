const express = require('express');
const {
    sendMessage,
    getMessages
} = require('../controllers/chatController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, getMessages);

module.exports = router;
