import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import { User } from '../models/User.js';

async function seedUsers() {
  await connectDatabase();

  const defaultUsers = [
    {
      name: 'System Admin',
      email: 'admin@swm.local',
      password: 'Admin12345!',
      role: 'admin',
    },
    {
      name: 'Municipal Worker',
      email: 'worker@swm.local',
      password: 'Worker12345!',
      role: 'worker',
    },
    {
      name: 'Citizen User',
      email: 'citizen@swm.local',
      password: 'Citizen12345!',
      role: 'citizen',
    },
  ];

  for (const user of defaultUsers) {
    const exists = await User.findOne({ email: user.email });
    if (!exists) {
      const hash = await bcrypt.hash(user.password, 12);
      await User.create({ ...user, password: hash });
    }
  }

  console.log('Seed complete: default users ensured');
  process.exit(0);
}

seedUsers().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
