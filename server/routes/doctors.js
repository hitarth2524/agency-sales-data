const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const cors = require('cors');
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

// Get all doctors for logged-in user
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ userId: req.user.userId });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add new doctor for logged-in user
router.post('/', async (req, res) => {
  try {
    const doctor = new Doctor({ ...req.body, userId: req.user.userId });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ msg: 'Error saving doctor', error: err.message });
  }
});

// Update doctor (only if it belongs to user)
router.put('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ msg: 'Error updating doctor', error: err.message });
  }
});

// Delete doctor (only if it belongs to user)
router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });
    res.json({ msg: 'Doctor deleted' });
  } catch (err) {
    res.status(400).json({ msg: 'Error deleting doctor', error: err.message });
  }
});

module.exports = router; 