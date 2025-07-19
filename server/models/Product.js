const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Compound unique index: name + userId
productSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema); 