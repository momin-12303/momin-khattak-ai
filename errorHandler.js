function errorHandler(err, req, res, next) {
    console.error('Error:', err.message);
    
    if (err.message.includes('API key not valid')) {
        return res.status(401).json({
            success: false,
            message: 'Invalid Gemini API key. Please check your configuration.'
        });
    }
    
    if (err.message.includes('Quota exceeded')) {
        return res.status(429).json({
            success: false,
            message: 'API quota exceeded. Please try again later.'
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Something went wrong with Momin Khattak AI. Please try again.'
    });
}

module.exports = errorHandler;