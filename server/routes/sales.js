const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
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

// List all sales
router.get('/all', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get sale by ID
router.get('/id/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all sales for a doctor
router.get('/doctor/:doctor', async (req, res) => {
  try {
    const sales = await Sale.find({ doctor: req.params.doctor }).sort({ date: -1 });
    if (!sales || sales.length === 0) return res.status(404).json({ message: 'No sale found for this doctor' });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all sales for logged-in user
router.get('/doctor/:doctorName', async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.user.userId, client: req.params.doctorName });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add new sale for logged-in user
router.post('/', async (req, res) => {
  try {
    const sale = new Sale({ ...req.body, userId: req.user.userId, date: new Date() });
    await sale.save();
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ msg: 'Error saving sale', error: err.message });
  }
});

// Update sale (only if it belongs to user)
router.put('/:id', async (req, res) => {
  try {
    const sale = await Sale.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!sale) return res.status(404).json({ msg: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(400).json({ msg: 'Error updating sale', error: err.message });
  }
});

// Delete sale (only if it belongs to user)
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!sale) return res.status(404).json({ msg: 'Sale not found' });
    res.json({ msg: 'Sale deleted' });
  } catch (err) {
    res.status(400).json({ msg: 'Error deleting sale', error: err.message });
  }
});

module.exports = router; 