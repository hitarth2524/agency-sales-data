const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Product = require('./models/Product');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/agency_sales_data', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const removeAllData = async () => {
  try {
    // Find the user haresh123
    const user = await User.findOne({ username: 'haresh123' });
    
    if (!user) {
      console.log('User haresh123 not found.');
      return;
    }

    console.log(`Found user: ${user.username} with ID: ${user._id}`);

    // Remove all doctors for this user
    const deletedDoctors = await Doctor.deleteMany({ userId: user._id });
    console.log(`Removed ${deletedDoctors.deletedCount} doctors`);

    // Remove all products for this user
    const deletedProducts = await Product.deleteMany({ userId: user._id });
    console.log(`Removed ${deletedProducts.deletedCount} products`);

    console.log('\n✅ All data removed successfully!');
    
  } catch (error) {
    console.error('Error removing data:', error);
  } finally {
    mongoose.connection.close();
  }
};

removeAllData(); 