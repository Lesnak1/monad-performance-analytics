"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
    });
});
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Monad Analytics API',
        version: '1.0.0',
        endpoints: [
            'GET /api/health',
            'GET /api/metrics',
            'POST /api/auth/login',
            'GET /api/transactions'
        ],
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=api.js.map