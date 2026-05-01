const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const limiter = {
    writeLimit: rateLimit({
        windowMs: 60 * 1000,
        max: 60,
        message: "Too many request",
        keyGenerator: (req) =>
            req.headers['x-api-key'] || ipKeyGenerator(req.ip),
    })
}

module.exports = limiter
