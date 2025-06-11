"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/login', (req, res) => {
    res.json({
        success: true,
        message: 'Login endpoint placeholder',
        timestamp: new Date().toISOString()
    });
});
router.post('/register', (req, res) => {
    res.json({
        success: true,
        message: 'Register endpoint placeholder',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map