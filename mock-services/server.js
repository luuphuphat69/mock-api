const express = require('express');
const app = express();
const port = 8080;
const connectDB = require('./connectdb');
const morgan = require('morgan')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = require('./routes/router');
require('dotenv').config();

const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Origin',
    'X-Requested-With',
    'Accept',
    'x-client-key',
    'x-client-token',
    'x-client-secret',
    'x-api-key',
    'Authorization'
  ],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('common'));
app.set('trust proxy', 1);

// Routes
app.use('/mock-api', router);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server only after DB connects
(async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
