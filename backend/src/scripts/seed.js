import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import { User } from '../models/User.js';
import { Bin } from '../models/Bin.js';
import { WorkerProfile } from '../models/WorkerProfile.js';

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
      const newUser = await User.create({ ...user, password: hash });
      
      // Create worker profile for worker user
      if (user.role === 'worker') {
        await WorkerProfile.create({
          user: newUser._id,
          assignedArea: 'Downtown District',
          availabilityStatus: 'available',
        });
      }
    }
  }

  // Seed bins
  const worker = await User.findOne({ email: 'worker@swm.local' });
  if (worker) {
    const bins = [
      {
        binId: 'BIN-001',
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749], // San Francisco coordinates
        },
        assignedWorker: worker._id,
        schedule: {
          frequency: 'daily',
          preferredTime: '09:00',
        },
        area: 'Downtown District',
      },
      {
        binId: 'BIN-002',
        location: {
          type: 'Point',
          coordinates: [-122.4183, 37.7750],
        },
        assignedWorker: worker._id,
        schedule: {
          frequency: 'daily',
          preferredTime: '10:00',
        },
        area: 'Downtown District',
      },
      {
        binId: 'BIN-003',
        location: {
          type: 'Point',
          coordinates: [-122.4172, 37.7751],
        },
        assignedWorker: worker._id,
        schedule: {
          frequency: 'weekly',
          preferredTime: '14:00',
        },
        area: 'Downtown District',
      },
    ];

    for (const bin of bins) {
      const exists = await Bin.findOne({ binId: bin.binId });
      if (!exists) {
        await Bin.create(bin);
      }
    }
  }

  console.log('Seed complete: default users, worker profiles, and bins ensured');
  process.exit(0);
}

seedUsers().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
