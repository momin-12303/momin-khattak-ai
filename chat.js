const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

router.post('/message', async (req, res, next) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const response = await geminiService.sendMessage(message);
        res.json(response);
        
    } catch (error) {
        next(error);
    }
});

router.post('/reset', async (req, res, next) => {
    try {
        geminiService.resetChat();
        res.json({
            success: true,
            message: 'Chat history reset successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;