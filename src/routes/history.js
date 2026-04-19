const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Generation = require('../models/Generation');

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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
