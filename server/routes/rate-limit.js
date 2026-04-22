const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const writeLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many request",
  keyGenerator: (req) => {
    return req.user?.id || ipKeyGenerator(req.ip);
  },
});

module.exports = {
    writeLimit
};