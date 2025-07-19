const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  reportTitle: { type: String },
  client: { type: String },
  doctor: { type: String, required: true },
  message: { type: String },
  discount: { type: Number, default: 0 },
  payable: { type: Number, default: 0 },
  rows: [
    {
      product: String,
      med1: Number,
      med2: Number,
      med3: Number,
      med4: Number,
      rate: Number,
    }
  ],
  date: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema); 