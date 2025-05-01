const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sanitize } = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();

// Enhanced Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Secure Body Parser
app.use(express.json({ limit: '10kb' }));

// Fixed Sanitization Middleware (No Query Modification)
app.use((req, res, next) => {
  const sanitizeData = (data) => {
    if (!data) return data;
    if (typeof data === 'object') {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key.replace(/\$/g, '_').replace(/\./g, '_'),
          sanitizeData(value)
        ])
      );
    }
    return data;
  };

  if (req.body) req.body = sanitizeData(req.body);
  if (req.query) req.query = sanitizeData(req.query);
  if (req.params) req.params = sanitizeData(req.params);
  
  next();
});

// MongoDB Atlas Connection with Retry Logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGO_URI, {
    retryWrites: true,
    w: 'majority',
    appName: 'userman'
  })
  .then(() => console.log('Successfully connected to MongoDB Atlas'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// Routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error('Error:', {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB Atlas Cluster: userman.jcfvhp8.mongodb.net`);
});