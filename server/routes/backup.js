const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Product = require('../models/Product');
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

// Change GET to POST and send as file
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.body;

    // Build date filter if provided
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const doctors = await Doctor.find({ userId });
    const products = await Product.find({ userId });
    const sales = await Sale.find({ userId, ...dateFilter });

    const backupData = {
      doctors,
      products,
      sales
    };

    res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    res.status(500).json({ msg: 'Error generating backup', error: err.message });
  }
});

module.exports = router; 