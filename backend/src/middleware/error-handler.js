/**
 * MedIntelliX Global Error Handler
 * Developed by: Sonia (Backend Architecture)
 */

function errorHandler(err, req, res, next) {
    console.error("[MedIntelliX Server Error]:", err.stack || err.message);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error occurred.";

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            statusCode,
            timestamp: new Date().toISOString()
        }
    });
}

module.exports = errorHandler;
