require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const { seedProducts } = require('./utils/seedProducts');

const app = express();

// 🔹 DB connection
connectDB();

// 🔹 Global middlewares
app.use(cors());
app.use(express.json());

// ✅ ROOT ROUTE (MUST BE BEFORE listen)
app.get('/', (req, res) => {
  res.status(200).send('Backend is running');
});

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend running'
  });
});

// 🔹 Routes
app.use('/api/auth', authRoutes);

// 🔹 Global error handler (LAST)
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Seed demo products
seedProducts();

// Product routes
app.use('/api/products', productRoutes);

// 🔹 Start server (ABSOLUTELY LAST)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
