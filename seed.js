const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// ── Import Models ─────────────────────────────────────────────────────────────
const User = require('./src/models/User');
const Generation = require('./src/models/Generation');

// ── Dummy Data ────────────────────────────────────────────────────────────────
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
  },
];

const generationSeeds = [
  {
    videoType: 'marketing',
    topic: 'AI-powered video generation tool',
    keywords: ['AI', 'automation', 'video', 'content creation'],
    audience: 'small business owners',
    tone: 'persuasive',
    duration: '30s',
    output: {
      title: 'Transform Your Content Game with AIVidGen',
      fullScript:
        "Struggling to create engaging video content? Meet AIVidGen — the AI tool that writes, storyboards, and scripts your videos in seconds. Whether you're launching a product or growing your brand, AIVidGen gives you professional results without the production cost. Try it free today.",
      scenes: [
        {
          sceneNumber: 1,
          timeRange: '0-8s',
          visual: 'Split screen: frustrated creator on left, polished video on right',
          script: "Struggling to create engaging video content? There's a better way.",
        },
        {
          sceneNumber: 2,
          timeRange: '8-20s',
          visual: 'Screen recording of AIVidGen UI generating a script in real time',
          script: 'Meet AIVidGen — the AI tool that writes, storyboards, and scripts your videos in seconds.',
        },
        {
          sceneNumber: 3,
          timeRange: '20-30s',
          visual: 'Happy business owner looking at their phone with metrics going up',
          script: 'Professional results. Zero production cost. Try AIVidGen free today.',
        },
      ],
    },
  },
  {
    videoType: 'educational',
    topic: 'How machine learning works',
    keywords: ['neural networks', 'data', 'training', 'model'],
    audience: 'high school students',
    tone: 'casual',
    duration: '60s',
    output: {
      title: 'Machine Learning Explained in 60 Seconds',
      fullScript:
        "Ever wonder how Netflix knows what you want to watch? That's machine learning! At its core, ML is about teaching computers to learn from data — just like how you learn from experience. We feed it examples, it finds patterns, and over time it gets smarter. Those neural networks powering it? They're inspired by your own brain.",
      scenes: [
        {
          sceneNumber: 1,
          timeRange: '0-12s',
          visual: 'Animation of Netflix recommendation interface',
          script: "Ever wonder how Netflix knows exactly what you want to watch next? That's machine learning at work.",
        },
        {
          sceneNumber: 2,
          timeRange: '12-30s',
          visual: 'Simple diagram: data → model → predictions',
          script: 'ML is about teaching computers to learn from data — we feed it examples and it finds patterns.',
        },
        {
          sceneNumber: 3,
          timeRange: '30-48s',
          visual: 'Animation of a simplified neural network with nodes lighting up',
          script: "The secret sauce? Neural networks — structures inspired by the human brain's own neurons.",
        },
        {
          sceneNumber: 4,
          timeRange: '48-60s',
          visual: 'Montage of ML applications: self-driving cars, voice assistants, medical scans',
          script: 'And with enough data and training, these models get smarter every single day.',
        },
      ],
    },
  },
  {
    videoType: 'social_media',
    topic: 'Morning productivity routine',
    keywords: ['productivity', 'morning', 'routine', 'wellness'],
    audience: 'young professionals',
    tone: 'inspirational',
    duration: '15s',
    output: {
      title: '5AM Club: Your Morning = Your Success',
      fullScript:
        'Win the morning, win the day. Journal. Move. Hydrate. No phone for the first hour. Small habits, massive results.',
      scenes: [
        {
          sceneNumber: 1,
          timeRange: '0-5s',
          visual: 'Sunrise timelapse with alarm going off at 5:00 AM',
          script: 'Win the morning, win the day.',
        },
        {
          sceneNumber: 2,
          timeRange: '5-12s',
          visual: 'Quick cuts: journaling, stretching, glass of water, phone face-down',
          script: 'Journal. Move. Hydrate. No phone for the first hour.',
        },
        {
          sceneNumber: 3,
          timeRange: '12-15s',
          visual: 'Person smiling confidently walking into office',
          script: 'Small habits. Massive results. Start tomorrow.',
        },
      ],
    },
  },
  {
    videoType: 'explainer',
    topic: 'What is blockchain technology',
    keywords: ['blockchain', 'decentralization', 'crypto', 'ledger'],
    audience: 'general public',
    tone: 'formal',
    duration: '90s',
    output: {
      title: "Blockchain Technology: The World's Most Trusted Ledger",
      fullScript:
        "Blockchain is a distributed digital ledger that records transactions across thousands of computers simultaneously. Unlike traditional databases controlled by a single entity, blockchain is decentralized — no single person or company owns it. Each block contains a set of transactions. Once recorded, the data cannot be altered without altering all subsequent blocks. This tamper-resistant structure is what makes blockchain the foundation of cryptocurrencies and increasingly, enterprise applications.",
      scenes: [
        {
          sceneNumber: 1,
          timeRange: '0-15s',
          visual: 'Animation of a traditional bank vault vs. a distributed network globe',
          script:
            'Imagine a ledger — but instead of being locked in one bank vault, copies exist on thousands of computers worldwide.',
        },
        {
          sceneNumber: 2,
          timeRange: '15-40s',
          visual: 'Animated blocks chaining together, each with a lock icon',
          script:
            'Each "block" holds a set of transactions. Once added to the chain, it cannot be changed without altering every block that follows.',
        },
        {
          sceneNumber: 3,
          timeRange: '40-65s',
          visual: 'Network diagram showing nodes validating a transaction',
          script:
            'This decentralization means no single authority controls the data — making it transparent and tamper-resistant.',
        },
        {
          sceneNumber: 4,
          timeRange: '65-90s',
          visual: 'Montage: Bitcoin, supply chain tracking, medical records, smart contracts',
          script:
            'From cryptocurrencies to supply chains to healthcare — blockchain is redefining how the world stores trust.',
        },
      ],
    },
  },
];

// ── Seed Function ─────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Generation.deleteMany({});
    console.log('🗑️  Cleared existing users and generations');

    // Create users (password hashing is handled by pre-save hook)
    const createdUsers = await User.create(users);
    console.log(`👤 Created ${createdUsers.length} users:`);
    createdUsers.forEach((u) => console.log(`   - ${u.name} (${u.email})`));

    // Assign generations: first 2 to john, last 2 to jane
    const john = createdUsers[0];
    const jane = createdUsers[1];

    const generationsWithUsers = generationSeeds.map((gen, i) => ({
      ...gen,
      userId: i < 2 ? john._id : jane._id,
    }));

    const createdGenerations = await Generation.create(generationsWithUsers);
    console.log(`🎬 Created ${createdGenerations.length} generations:`);
    createdGenerations.forEach((g) =>
      console.log(`   - [${g.videoType}] "${g.output.title}" → userId: ${g.userId}`)
    );

    console.log('\n✅ Seed complete!');
    console.log('\n📋 Test Credentials:');
    console.log('   Email: john@example.com  | Password: password123');
    console.log('   Email: jane@example.com  | Password: password123');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seed();
