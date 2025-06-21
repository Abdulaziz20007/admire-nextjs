import mongoose from 'mongoose';
import { Admin } from '@/db/models';
import connectDB from '@/lib/mongodb';

/**
 * Seed script to create initial admin user
 * Run with: npx ts-node src/scripts/seed-admin.ts
 */
async function seedAdmin() {
  try {
    console.log('🌱 Starting admin seeding...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      return;
    }

    // Create initial admin user
    const adminData = {
      name: 'Super',
      surname: 'Admin',
      username: 'admin',
      password: 'admin123', // Will be hashed by pre-save middleware
      priority: '3', // Full access
      avatar: undefined
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully');
    console.log('📋 Admin details:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Name: ${admin.name} ${admin.surname}`);
    console.log(`   Priority: ${admin.priority} (Full Access)`);
    console.log(`   ID: ${admin._id}`);
    console.log('');
    console.log('🔐 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('');
    console.log('⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedAdmin();
