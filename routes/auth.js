const express = require('express');
const {
    register,
    login,
    getMe,
    allUsers
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, allUsers);

module.exports = router;
