const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // FIXED: Check if req.cookies exists AND if the token exists.
  // If cookie-parser didn't run or failed, req.cookies will be undefined.
  // Accessing .token on undefined causes the server to crash.
  const token = req.cookies && req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY); 
    req.user = decoded; 
    next(); 
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
}

module.exports = verifyToken;