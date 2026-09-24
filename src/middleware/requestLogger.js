import { randomUUID } from "crypto";

export const requestLogger = (req, res, next) => {
    const requestId = randomUUID();

    req.requestId = requestId;

    res.setHeader("X-Request-ID", requestId);

    const startTime = Date.now();

    res.on("finish", () => {
        const responseTime = Date.now() - startTime;

        console.log({
            requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`
        });
    });

    next();
};