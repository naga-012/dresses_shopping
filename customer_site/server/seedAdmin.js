const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdminUser = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mensverse';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sahamenswear.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    let adminUser = await User.findOne({ email: adminEmail });
    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.name = 'Saha Admin';
      adminUser.password = adminPassword;
      await adminUser.save();
      console.log(`✅ Admin account updated successfully: ${adminEmail}`);
    } else {
      adminUser = await User.create({
        name: 'Saha Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '9876543210'
      });
      console.log(`✅ Admin account created successfully: ${adminEmail}`);
    }

    console.log('\n--- Admin Credentials ---');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     admin`);
    console.log('-------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
};

seedAdminUser();
