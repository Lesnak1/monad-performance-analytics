"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/current', (req, res) => {
    res.json({
        success: true,
        data: {
            tps: 150,
            gasPrice: 52.4,
            blockTime: 0.6,
            networkHealth: 96,
            blockNumber: 21111778,
            timestamp: Date.now()
        },
        timestamp: new Date().toISOString()
    });
});
router.get('/history', (req, res) => {
    res.json({
        success: true,
        data: [],
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=metrics.js.map