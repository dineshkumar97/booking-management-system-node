import rateLimit from "express-rate-limit";
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message:
            "Too many login attempts. Please try again after 15 minutes."
    }
});

export const otpSendRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message:
            "Too many OTP requests. Please try again after 15 minutes."
    }
});

export const otpVerifyRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message:
            "Too many OTP verification attempts. Please try again later."
    }
});