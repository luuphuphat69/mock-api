const express = require('express');
const app = express();
const port = 8000;
const connectDB = require('./connectdb');
const morgan = require('morgan')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = require('../server/routes/route');

app.use(cors({
  origin: ['https://mock-api-rosy.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api', router);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server only after DB connects
(async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
