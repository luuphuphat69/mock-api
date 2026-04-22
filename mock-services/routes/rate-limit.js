const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const limter = {
    writeLimit: () => {
        const limit = rateLimit({
            windowMs: 60 * 1000,
            max: 20,
            message: "Too many request",
            keyGenerator: (req, res) =>
                req.headers['x-api-key'] || ipKeyGenerator(req.ip),
        })
        return limit;
    }
}
module.exports = limter