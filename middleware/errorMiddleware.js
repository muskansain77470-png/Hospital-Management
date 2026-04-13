const errorHandler = (err, req, res, next) => {
    // If the status code is 200, but we're in the error handler, make it 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        message: err.message,
        // Only show the stack trace if we are NOT in production
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

// CRITICAL: Exporting as an object so it can be destructured in index.js
module.exports = { errorHandler };