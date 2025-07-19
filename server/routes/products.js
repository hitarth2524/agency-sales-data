const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Auth middleware
function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

// All routes below require authentication
router.use(auth);

// Get all products for logged-in user
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.userId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add new product for logged-in user
router.post('/', async (req, res) => {
  try {
    const product = new Product({ ...req.body, userId: req.user.userId });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ msg: 'Error saving product', error: err.message });
  }
});

// Update product (only if it belongs to user)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ msg: 'Error updating product', error: err.message });
  }
});

// Delete product (only if it belongs to user)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ msg: 'Error deleting product', error: err.message });
  }
});

module.exports = router; 