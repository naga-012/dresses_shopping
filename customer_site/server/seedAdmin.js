const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdminUser = async () => {
  try {
    const connectDB = require('./config/db');
    await connectDB();

    const adminEmail = (process.env.ADMIN_EMAIL || 'myakalanagarjun@gmail.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'naga@012';

    // Demote any other users with admin role to regular user
    await User.updateMany({ email: { $ne: adminEmail } }, { role: 'user' }).catch(() => {});

    let adminUser = await User.findOne({ email: adminEmail });
    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.name = 'Nagarjun (Admin)';
      adminUser.password = adminPassword;
      await adminUser.save();
      console.log(`✅ Admin account updated successfully: ${adminEmail}`);
    } else {
      adminUser = await User.create({
        name: 'Nagarjun (Admin)',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '9876543210'
      });
      console.log(`✅ Admin account created successfully: ${adminEmail}`);
    }

    console.log('\n--- Authorized Admin Credentials ---');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     admin`);
    console.log('-------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
};

seedAdminUser();
