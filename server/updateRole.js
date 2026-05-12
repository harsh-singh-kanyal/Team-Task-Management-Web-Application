const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const user = await User.findOneAndUpdate({ email: 'testuser12345@bezill.com' }, { role: 'member' }, { new: true });
    if (user) {
      console.log('Successfully updated user to member:', user.email);
    } else {
      console.log('User not found');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('DB Error:', err);
    process.exit(1);
  });
