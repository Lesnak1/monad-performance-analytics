"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DatabaseService_1 = require("../services/DatabaseService");
const logger_1 = __importDefault(require("../utils/logger"));
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
router.post('/register', rateLimiter_1.authRateLimiter, async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
            return;
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        const dbService = DatabaseService_1.DatabaseService.getInstance();
        const existingUser = await dbService.getUserByEmail(email);
        if (existingUser) {
            res.status(409).json({
                success: false,
                error: 'User already exists with this email'
            });
            return;
        }
        const newUser = await dbService.createUser({
            email,
            passwordHash: hashedPassword,
            name: name || email.split('@')[0],
            createdAt: new Date(),
            lastLogin: null
        });
        const payload = {
            userId: newUser.id,
            email: newUser.email,
            name: newUser.name
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '24h' });
        logger_1.default.info(`New user registered: ${email}`);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    createdAt: newUser.createdAt
                },
                token
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
            message: 'Internal server error'
        });
    }
});
router.post('/login', rateLimiter_1.authRateLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
            return;
        }
        const dbService = DatabaseService_1.DatabaseService.getInstance();
        const user = await dbService.getUserByEmail(email);
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }
        const isValidPassword = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            logger_1.default.warn(`Failed login attempt for: ${email}`, { ip: req.ip });
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }
        await dbService.updateUserLastLogin(user.id);
        const payload = {
            userId: user.id,
            email: user.email,
            name: user.name
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '24h' });
        logger_1.default.info(`User logged in: ${email}`);
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    lastLogin: user.lastLogin
                },
                token
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            message: 'Internal server error'
        });
    }
});
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'No token provided'
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const dbService = DatabaseService_1.DatabaseService.getInstance();
        const user = await dbService.getUserById(decoded.userId);
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Token is valid',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    lastLogin: user.lastLogin
                }
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
            return;
        }
        logger_1.default.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Token verification failed'
        });
    }
});
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful. Please remove token from client.',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map