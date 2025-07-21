const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'https://agency-sales-data.vercel.app', // Vercel frontend URL
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Placeholder route
app.get('/', (req, res) => {
  res.send('Agency Sales API running');
});

// Register authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const salesRoutes = require('./routes/sales');
app.use('/api/sales', salesRoutes);

const doctorsRoutes = require('./routes/doctors');
app.use('/api/doctors', doctorsRoutes);

const productsRoutes = require('./routes/products');
app.use('/api/products', productsRoutes);

// Register backup route
const backupRoutes = require('./routes/backup');
app.use('/api/backup', backupRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 