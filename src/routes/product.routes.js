const express = require('express');
const router = express.Router();

const { getProducts } = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');

// 🔐 Protected route
router.get('/', protect, getProducts);

module.exports = router;
