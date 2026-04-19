const mongoose = require('mongoose');

const sceneSchema = new mongoose.Schema(
  {
    sceneNumber: { type: Number },
    timeRange: { type: String },
    visual: { type: String },
    script: { type: String },
  },
  { _id: false }
);

const generationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'userId is required'],
  },
  videoType: {
    type: String,
    enum: ['marketing', 'educational', 'social_media', 'explainer'],
    required: [true, 'videoType is required'],
  },
  topic: {
    type: String,
    required: [true, 'topic is required'],
    trim: true,
  },
  keywords: {
    type: [String],
    default: [],
  },
  audience: {
    type: String,
    trim: true,
  },
  tone: {
    type: String,
    enum: ['formal', 'casual', 'persuasive', 'inspirational'],
  },
  duration: {
    type: String,
    enum: ['15s', '30s', '60s', '90s'],
  },
  output: {
    title: { type: String },
    fullScript: { type: String },
    scenes: { type: [sceneSchema], default: [] },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Generation', generationSchema);
