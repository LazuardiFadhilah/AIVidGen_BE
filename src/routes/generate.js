const express = require('express');
const OpenAI = require('openai');
const { protect } = require('../middleware/auth');
const Generation = require('../models/Generation');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @route   POST /api/generate
// @desc    Generate a video script via OpenAI and persist it
// @access  Protected
router.post('/', protect, async (req, res) => {
  const { videoType, topic, keywords = [], audience, tone, duration } = req.body;

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!videoType || !topic) {
    return res.status(400).json({ message: 'videoType and topic are required' });
  }

  const validVideoTypes = ['marketing', 'educational', 'social_media', 'explainer'];
  const validTones = ['formal', 'casual', 'persuasive', 'inspirational'];
  const validDurations = ['15s', '30s', '60s', '90s'];

  if (!validVideoTypes.includes(videoType)) {
    return res.status(400).json({ message: `videoType must be one of: ${validVideoTypes.join(', ')}` });
  }
  if (tone && !validTones.includes(tone)) {
    return res.status(400).json({ message: `tone must be one of: ${validTones.join(', ')}` });
  }
  if (duration && !validDurations.includes(duration)) {
    return res.status(400).json({ message: `duration must be one of: ${validDurations.join(', ')}` });
  }

  // ── Build prompts ────────────────────────────────────────────────────────────
  const systemPrompt =
    'You are a professional video scriptwriter. Return only valid JSON, no markdown, no explanation.';

  const userPrompt = `Create a ${videoType} video script about '${topic}' for ${audience || 'general'} audience.
Tone: ${tone || 'casual'}. Duration: ${duration || '30s'}. Include keywords: ${keywords.join(', ') || 'none'}.
Return JSON exactly like this:
{ "title": "", "fullScript": "", "scenes": [{ "sceneNumber": 1, "timeRange": "0-10s", "visual": "", "script": "" }] }`;

  // ── Call OpenAI ──────────────────────────────────────────────────────────────
  let parsedOutput;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    const rawContent = completion.choices[0].message.content;

    try {
      parsedOutput = JSON.parse(rawContent);
    } catch {
      return res.status(502).json({
        message: 'OpenAI returned an invalid JSON response',
        raw: rawContent,
      });
    }
  } catch (openAiError) {
    const status = openAiError.status || 502;
    return res.status(status).json({
      message: 'OpenAI request failed',
      error: openAiError.message,
    });
  }

  // ── Persist to MongoDB ───────────────────────────────────────────────────────
  try {
    const generation = await Generation.create({
      userId: req.user.id,
      videoType,
      topic,
      keywords,
      audience,
      tone,
      duration,
      output: {
        title: parsedOutput.title,
        fullScript: parsedOutput.fullScript,
        scenes: parsedOutput.scenes,
      },
    });

    res.status(201).json({ generation });
  } catch (dbError) {
    res.status(500).json({ message: 'Failed to save generation', error: dbError.message });
  }
});

module.exports = router;
