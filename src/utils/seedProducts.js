const Product = require('../models/Product');

const demoProducts = [
  {
    name: 'Laptop',
    description: 'High performance laptop',
    price: 80000,
    category: 'Electronics',
    inStock: true
  },
  {
    name: 'Headphones',
    description: 'Noise cancelling headphones',
    price: 12000,
    category: 'Electronics',
    inStock: true
  },
  {
    name: 'Office Chair',
    description: 'Ergonomic chair',
    price: 15000,
    category: 'Furniture',
    inStock: false
  }
];

exports.seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(demoProducts);
    console.log('Demo products seeded');
  }
};
