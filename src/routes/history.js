const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Generation = require('../models/Generation');

const router = express.Router();

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   PUT /api/history/:id
// @desc    Update and re-generate a script
// @access  Protected
router.put('/:id', protect, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid generation ID' });
  }

  const { videoType, topic, keywords = [], audience, tone, duration } = req.body;

  try {
    let generation = await Generation.findById(req.params.id);

    if (!generation) {
      return res.status(404).json({ message: 'Generation not found' });
    }

    if (generation.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this generation' });
    }

    // ── Re-generate with OpenAI ──────────────────────────────────────────────
    const systemPrompt = 'You are a professional video scriptwriter. Return only valid JSON, no markdown, no explanation.';
    const userPrompt = `Create a ${videoType} video script about '${topic}' for ${audience || 'general'} audience.
Tone: ${tone || 'casual'}. Duration: ${duration || '30s'}. Include keywords: ${keywords.join(', ') || 'none'}.
Return JSON exactly like this:
{ "title": "", "fullScript": "", "scenes": [{ "sceneNumber": 1, "timeRange": "0-10s", "visual": "", "script": "" }] }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    const parsedOutput = JSON.parse(completion.choices[0].message.content);

    // ── Update in Database ───────────────────────────────────────────────────
    generation.videoType = videoType || generation.videoType;
    generation.topic = topic || generation.topic;
    generation.keywords = keywords || generation.keywords;
    generation.audience = audience || generation.audience;
    generation.tone = tone || generation.tone;
    generation.duration = duration || generation.duration;
    generation.output = {
      title: parsedOutput.title,
      fullScript: parsedOutput.fullScript,
      scenes: parsedOutput.scenes,
    };

    await generation.save();

    res.json({ generation });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update generation', error: error.message });
  }
});

// @route   GET /api/history
// @desc    Get all generations for the authenticated user
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const generations = await Generation.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ count: generations.length, generations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/history/:id
// @desc    Get a single generation by ID (must belong to the authenticated user)
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid generation ID' });
  }

  try {
    const generation = await Generation.findById(req.params.id);

    if (!generation) {
      return res.status(404).json({ message: 'Generation not found' });
    }

    if (generation.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this generation' });
    }

    res.json({ generation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/history/:id
// @desc    Delete a generation by ID (must belong to the authenticated user)
// @access  Protected
router.delete('/:id', protect, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid generation ID' });
  }

  try {
    const generation = await Generation.findById(req.params.id);

    if (!generation) {
      return res.status(404).json({ message: 'Generation not found' });
    }

    if (generation.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this generation' });
    }

    await generation.deleteOne();

    res.json({ message: 'Generation deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
