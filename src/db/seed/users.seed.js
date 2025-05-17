import bcrypt from 'bcrypt';
import { UsersCollection } from '../models/user.js';
import { RolesCollection } from '../models/resources/role.js';

export const seedUsers = async () => {
  const existingUser = await UsersCollection.findOne({ email: 'super.admin@gmail.com' });

  if (existingUser) {
    console.log('SuperAdmin user already seeded');
    return;
  }

  const superAdminRole = await RolesCollection.findOne({ name: 'SuperAdmin' });

  if (!superAdminRole) {
    console.error('❌ SuperAdmin role not found. Seed roles first!');
    return;
  }

  const password = '123456789!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new UsersCollection({
    name: 'SuperAdmin',
    email: 'super.admin@gmail.com',
    password: hashedPassword,
    avatar: 'https://i.pinimg.com/736x/7b/8c/d8/7b8cd8b068e4b9f80b4bcf0928d7d499.jpg',
    roleId: superAdminRole._id,
  });

  await newUser.save();
  console.log('SuperAdmin user seeded successfully ✅');
};
