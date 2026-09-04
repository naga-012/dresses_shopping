const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../server/config/db');

mongoose.set('bufferCommands', false);
mongoose.set('autoIndex', false);
mongoose.set('autoCreate', false);

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// URL normalization middleware for Vercel serverless routing
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.substring(4) || '/';
  }
  next();
});

// Mount routes
app.use('/auth', require('../server/routes/auth'));
app.use('/products', require('../server/routes/products'));
app.use('/categories', require('../server/routes/categories'));
app.use('/collections', require('../server/routes/collections'));
app.use('/orders', require('../server/routes/orders'));
app.use('/admin', require('../server/routes/admin'));
app.use('/settings', require('../server/routes/settings'));
app.use('/upload', require('../server/routes/upload'));

app.get('/', (req, res) => res.json({ status: 'ok', message: "SAHA MEN'S STORE Vercel API running" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Vercel API error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

module.exports = app;
