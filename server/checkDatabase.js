const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Product = require('./models/Product');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/agency_sales_data', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const checkDatabase = async () => {
  try {
    console.log('🔍 Checking Database Contents...\n');

    // Check Users
    const users = await User.find({});
    console.log(`📊 Total Users: ${users.length}`);
    if (users.length > 0) {
      console.log('Users in database:');
      users.forEach(user => {
        console.log(`  - Username: ${user.username}, Email: ${user.email}, ID: ${user._id}`);
      });
    } else {
      console.log('  ❌ No users found in database');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Check Doctors
    const doctors = await Doctor.find({});
    console.log(`👨‍⚕️ Total Doctors: ${doctors.length}`);
    if (doctors.length > 0) {
      console.log('Doctors in database:');
      doctors.forEach(doctor => {
        console.log(`  - Name: ${doctor.name}, User ID: ${doctor.userId}`);
      });
    } else {
      console.log('  ❌ No doctors found in database');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Check Products
    const products = await Product.find({});
    console.log(`💊 Total Products: ${products.length}`);
    if (products.length > 0) {
      console.log('Products in database:');
      products.forEach(product => {
        console.log(`  - Name: ${product.name}, User ID: ${product.userId}`);
      });
    } else {
      console.log('  ❌ No products found in database');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Check database connection
    console.log('🔗 Database Connection Status:');
    console.log(`  - Connected: ${mongoose.connection.readyState === 1 ? '✅ Yes' : '❌ No'}`);
    console.log(`  - Database: ${mongoose.connection.name}`);
    console.log(`  - Host: ${mongoose.connection.host}`);

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkDatabase(); 