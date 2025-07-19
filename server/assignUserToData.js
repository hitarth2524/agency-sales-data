const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/agency_sales_data', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const assignUserToData = async () => {
  try {
    // Find the user haresh1010
    const user = await User.findOne({ username: 'haresh1010' });
    if (!user) {
      console.log('User haresh1010 not found.');
      return;
    }
    console.log(`Found user: ${user.username} with ID: ${user._id}`);

    // Update all doctors
    const doctorResult = await Doctor.updateMany({}, { $set: { userId: user._id } });
    console.log(`Updated ${doctorResult.modifiedCount} doctors.`);

    // Update all products
    const productResult = await Product.updateMany({}, { $set: { userId: user._id } });
    console.log(`Updated ${productResult.modifiedCount} products.`);

    // Update all sales
    const saleResult = await Sale.updateMany({}, { $set: { userId: user._id } });
    console.log(`Updated ${saleResult.modifiedCount} sales.`);

    console.log('✅ All data assigned to user haresh1010!');
  } catch (error) {
    console.error('Error assigning user to data:', error);
  } finally {
    mongoose.connection.close();
  }
};

assignUserToData(); 