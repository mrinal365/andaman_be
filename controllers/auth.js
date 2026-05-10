const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIEN_ID);

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
// @example Body: { "name": "Jane Doe", "email": "jane@andaman.com", "handle": "janedoe", "password": "password123" }
exports.register = async (req, res, next) => {
    try {
        const { name, email, handle, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { handle }] });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or handle already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            handle,
            password
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
// @example Body: { "email": "jane@andaman.com", "password": "password123" }
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // // Update lastSeen : not required now not the best approach - removed lastseen from user model 
        // user.lastSeen = Date.now();
        // await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
// @example Header: Authorization: Bearer <token>
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get all users (search via ?search=)
// @route   GET /api/v1/user?search=
// @access  Private
exports.allUsers = async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { handle: { $regex: req.query.search, $options: 'i' } }
            ]
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
};

// @desc    Google login
// @route   POST /api/v1/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
    try {
        const { token } = req.body;

        // Fetch user info from Google using access token
        const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        const googleData = await googleRes.json();

        if (!googleData.email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Google token'
            });
        }

        const { email, name, picture } = googleData;

        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            // Generate unique handle
            let baseHandle = name.replace(/\s+/g, '').toLowerCase();
            let isHandleUnique = false;
            let finalHandle = baseHandle;

            while (!isHandleUnique) {
                const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
                finalHandle = `${baseHandle}${randomNum}`;
                const existingHandle = await User.findOne({ handle: finalHandle });
                if (!existingHandle) {
                    isHandleUnique = true;
                }
            }

            // Generate random 20 digit password
            const randomPassword = crypto.randomBytes(10).toString('hex');

            user = await User.create({
                name,
                email,
                handle: finalHandle,
                password: randomPassword,
                avatar: picture || 'default-avatar.png'
            });
        }

        const jwtToken = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token: jwtToken,
            isNewUser,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                handle: user.handle,
                avatar: user.avatar,
                blockedByAdmin: user.blockedByAdmin
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Google login failed: ' + err.message
        });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token
    });
};
