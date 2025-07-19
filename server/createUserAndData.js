const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Product = require('./models/Product');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/agency_sales_data', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createUserAndData = async () => {
  try {
    // Check if user already exists
    let user = await User.findOne({ username: 'haresh123' });
    
    if (!user) {
      // Create new user
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = new User({
        username: 'haresh123',
        email: 'haresh123@example.com',
        password: hashedPassword
      });
      await user.save();
      console.log('User haresh123 created successfully!');
    } else {
      console.log('User haresh123 already exists.');
    }

    console.log(`User ID: ${user._id}`);

    // Sample doctors
    const doctors = [
      { name: 'Dr. Rajesh Kumar', userId: user._id },
      { name: 'Dr. Priya Sharma', userId: user._id },
      { name: 'Dr. Amit Patel', userId: user._id },
      { name: 'Dr. Neha Singh', userId: user._id },
      { name: 'Dr. Sanjay Verma', userId: user._id },
      { name: 'Dr. Meera Gupta', userId: user._id },
      { name: 'Dr. Vikram Malhotra', userId: user._id },
      { name: 'Dr. Anjali Desai', userId: user._id }
    ];

    // Sample products
    const products = [
      { name: 'Paracetamol 500mg', userId: user._id },
      { name: 'Amoxicillin 250mg', userId: user._id },
      { name: 'Omeprazole 20mg', userId: user._id },
      { name: 'Cetirizine 10mg', userId: user._id },
      { name: 'Metformin 500mg', userId: user._id },
      { name: 'Amlodipine 5mg', userId: user._id },
      { name: 'Atorvastatin 10mg', userId: user._id },
      { name: 'Losartan 50mg', userId: user._id },
      { name: 'Vitamin D3 1000IU', userId: user._id },
      { name: 'Calcium Carbonate 500mg', userId: user._id }
    ];

    // Clear existing data for this user
    await Doctor.deleteMany({ userId: user._id });
    await Product.deleteMany({ userId: user._id });

    // Add doctors
    const addedDoctors = await Doctor.insertMany(doctors);
    console.log(`\nAdded ${addedDoctors.length} doctors:`);
    addedDoctors.forEach(doctor => console.log(`- ${doctor.name}`));

    // Add products
    const addedProducts = await Product.insertMany(products);
    console.log(`\nAdded ${addedProducts.length} products:`);
    addedProducts.forEach(product => console.log(`- ${product.name}`));

    console.log('\n✅ Sample data added successfully!');
    console.log('\nLogin credentials:');
    console.log('Username: haresh123');
    console.log('Password: password123');
    
    console.log(new Date().toLocaleDateString('en-GB'));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

createUserAndData(); 