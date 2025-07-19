const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/agency_sales_data', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const targetUsernames = ['parth88', 'hitesh007', 'hardik2012'];
const sourceUsername = 'haresh1010';

const run = async () => {
  try {
    // Get source user
    const sourceUser = await User.findOne({ username: sourceUsername });
    if (!sourceUser) {
      console.log('Source user not found');
      return;
    }

    // Get products of source user
    const products = await Product.find({ userId: sourceUser._id });

    // For each target user
    for (const username of targetUsernames) {
      const user = await User.findOne({ username });
      if (!user) {
        console.log(`User ${username} not found`);
        continue;
      }

      for (const prod of products) {
        // Check if product with same name already exists for this user
        const exists = await Product.findOne({ name: prod.name, userId: user._id });
        if (!exists) {
          const newProd = new Product({
            name: prod.name,
            userId: user._id
          });
          await newProd.save();
          console.log(`Product '${prod.name}' copied to user ${username}`);
        } else {
          console.log(`Product '${prod.name}' already exists for user ${username}`);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
};

run(); 