import mongoose from 'mongoose';
import connectDB from './config/database.js';
import User from './models/User.js';
import fs from 'fs';

async function migrateUsers() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Read existing users from JSON
    const usersData = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
    
    console.log(`Found ${usersData.length} users to migrate...`);
    
    for (const userData of usersData) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const user = new User({
          name: userData.name,
          email: userData.email
        });
        await user.save();
        console.log(`Migrated user: ${userData.name} (${userData.email})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }
    
    console.log('Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateUsers();
