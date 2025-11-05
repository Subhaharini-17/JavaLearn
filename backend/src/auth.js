// src/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// ----------------------
// 🧩 Helper: Token creation
// ----------------------
const createToken = (userId, role, email, name) => {
    return jwt.sign(
        { 
            id: userId,
            role: role,
            email: email,
            name: name
        },
        process.env.JWT_SECRET || 'dev_secret_fallback_key_12345',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ----------------------
// 🆕 🧩 User Registration (PLAIN TEXT PASSWORD)
// ----------------------
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 1 }).withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, msg: errors.array()[0].msg });
        }

        const { name, email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        try {
            // 1. Check if user already exists
            let user = await User.findOne({ email: normalizedEmail });
            if (user) {
                return res.status(400).json({ success: false, msg: 'Email already registered' });
            }

            // 2. Create and save user with PLAIN TEXT PASSWORD
            user = new User({
                name,
                email: normalizedEmail,
                password: password, // Store plain text password
                role: 'student', // Default role
            });

            await user.save();

            // 3. Generate token (auto-login)
            const token = createToken(user._id, user.role, user.email, user.name);

            // 4. Return token and complete user data structure
            res.status(201).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    class: user.class || null,
                    department: user.department || null,
                    year: user.year || null,
                    progress: user.progress || {
                        totalTutorials: 0,
                        completedTutorialsCount: 0, 
                        completionPercentage: 0
                    },
                    completedTutorials: user.completedTutorials || []
                },
                msg: 'Registration successful! Welcome.',
            });

        } catch (err) {
            console.error('🔥 Registration error:', err);
            let errorMessage = 'Server error during registration';

            if (err.code === 11000) {
                errorMessage = 'Email already exists. Please try logging in.';
                return res.status(400).json({ success: false, msg: errorMessage });
            }
            
            res.status(500).json({ success: false, msg: errorMessage });
        }
    }
);

// ----------------------
// 🧩 User Login (PLAIN TEXT COMPARISON)
// ----------------------
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, msg: errors.array()[0].msg });
        }

        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        try {
            // 1. Find user by email
            const user = await User.findOne({ email: normalizedEmail });
            
            if (!user) {
                return res.status(401).json({ success: false, msg: 'Invalid credentials' });
            }

            // 2. Compare passwords directly (PLAIN TEXT)
            if (password !== user.password) {
                return res.status(401).json({ success: false, msg: 'Invalid credentials' });
            }

            // 3. Create token
            const token = createToken(user._id, user.role, user.email, user.name);

            // 4. Return complete user data
            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    class: user.class || null,
                    department: user.department || null,
                    year: user.year || null,
                    progress: user.progress || {
                        totalTutorials: 0,
                        completedTutorialsCount: 0, 
                        completionPercentage: 0
                    },
                    completedTutorials: user.completedTutorials || []
                },
                msg: 'Login successful'
            });

        } catch (err) {
            console.error('🔥 Login error:', err);
            res.status(500).json({ 
                success: false,
                msg: 'Server error during login' 
            });
        }
    }
);

// ----------------------
// 🧩 Get Current User
// ----------------------
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ success: false, msg: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_fallback_key_12345');
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }
        
        // Return user data (without password)
        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                class: user.class || null,
                department: user.department || null,
                year: user.year || null,
                progress: user.progress || {
                    totalTutorials: 0,
                    completedTutorialsCount: 0, 
                    completionPercentage: 0
                },
                completedTutorials: user.completedTutorials || []
            },
            msg: 'User profile fetched successfully'
        });

    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, msg: 'Token is not valid' });
        }
        console.error('🔥 Get User error:', err);
        res.status(500).json({ success: false, msg: 'Server error fetching user profile' });
    }
});

module.exports = router;