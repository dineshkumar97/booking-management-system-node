export const errorHandler = (err, req, res, next) => {
     console.error("❌ Error:", {
        requestId: req.requestId,
        error: err.message,
        stack: err.stack
    });
    // MongoDB duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({
            message: "Record already exists.",
             requestId: req.requestId
        });
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "Validation failed.",
             requestId: req.requestId,
            errors: Object.values(err.errors).map(
                (error) => error.message
            )
        });
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid ID.",
             requestId: req.requestId
        });
    }

    // Custom status code
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            message: err.message,
             requestId: req.requestId
        });
    }

    // Default server error
    return res.status(500).json({
        message: "Something went wrong.",
         requestId: req.requestId
    });
};