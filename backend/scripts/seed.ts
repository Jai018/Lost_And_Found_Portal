import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User';
import { Item } from '../src/models/Item';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/findit';

const seedDB = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected.');

    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Item.deleteMany({});

    console.log('👤 Creating users...');
    // We don't hash manually because the UserSchema.pre('save') hook hashes it!
    const plainPassword = 'password123';

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@findit.com',
      password: plainPassword,
      role: 'admin',
      isVerified: true,
      trustScore: 100,

      badges: ['first_report', 'trusted_finder', 'verified'],
      stats: { itemsReported: 5, itemsFound: 10, successfulReturns: 8, responseRate: 100 },
    });

    const alice = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: plainPassword,
      role: 'user',
      isVerified: true,
      trustScore: 85,

      badges: ['first_report'],
      stats: { itemsReported: 2, itemsFound: 1, successfulReturns: 1, responseRate: 95 },
    });

    const bob = await User.create({
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: plainPassword,
      role: 'user',
      isVerified: false,
      trustScore: 50,

      badges: [],
      stats: { itemsReported: 1, itemsFound: 0, successfulReturns: 0, responseRate: 80 },
    });

    console.log('📦 Creating items...');
    await Item.create([
      {
        type: 'lost',
        title: 'Black Leather Wallet',
        description: 'Lost a black leather wallet near Central Library reading hall. Contains student ID and some cash. Please contact if found!',
        category: 'Bags & Wallets',
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'],
        location: {
          address: 'Central Library, 2nd Floor',
          city: 'Campus',
          state: 'Library Block',
          country: 'India',
          coordinates: [80.2707, 13.0827],
        },
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        reward: 50,
        tags: ['wallet', 'leather', 'black'],
        reportedBy: alice._id,
        views: 24,
      },
      {
        type: 'found',
        title: 'Apple AirPods Pro',
        description: 'Found a pair of AirPods Pro in a white case at the Main Library, 2nd floor.',
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800'],
        location: {
          address: 'Main Library, 2nd Floor',
          city: 'Campus',
          state: 'Library Block',
          country: 'India',
          coordinates: [80.2707, 13.0827],
        },
        date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        tags: ['airpods', 'apple', 'headphones'],
        reportedBy: bob._id,
        views: 12,
        verificationQuestions: [{ question: 'What name is engraved on the case?', answer: 'Bob' }],
      },
      {
        type: 'lost',
        title: 'Physics Textbook - Halliday Resnick',
        description: 'Lost my Physics textbook near the student cafeteria. It has my name inside the front cover.',
        category: 'Books',
        images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800'],
        location: {
          address: 'Student Canteen / Cafeteria',
          city: 'Campus',
          state: 'Student Center',
          country: 'India',
          coordinates: [80.2707, 13.0827],
        },
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        reward: 0,
        tags: ['book', 'textbook', 'physics'],
        reportedBy: admin._id,
        views: 156,
      },
      {
        type: 'found',
        title: 'Set of Hostel Room Keys',
        description: 'Found 3 keys on a red carabiner near the Computer Science Lab 204 entrance.',
        category: 'Keys',
        images: ['https://images.unsplash.com/photo-1584447128309-b66b7a4d1b63?auto=format&fit=crop&q=80&w=800'],
        location: {
          address: 'CS Lab Block, Room 204',
          city: 'Campus',
          state: 'CS Department',
          country: 'India',
          coordinates: [80.2707, 13.0827],
        },
        date: new Date(),
        tags: ['keys', 'carabiner', 'red', 'hostel'],
        reportedBy: alice._id,
        views: 5,
      },
    ]);

    console.log('✨ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
