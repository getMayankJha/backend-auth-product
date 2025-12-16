const Product = require('../models/Product');

/**
 * @desc Get all products (Protected)
 * @route GET /api/products
 * @access Private
 */
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
