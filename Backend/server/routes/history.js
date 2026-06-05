const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/history
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.watchHistory || []);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/history
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { videoId, title, channelTitle } = req.body;
    if (!videoId || !title) {
      return res.status(400).json({ message: 'videoId and title are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize if missing
    if (!user.watchHistory) {
      user.watchHistory = [];
    }

    // Remove if already exists so we can move it to the top
    user.watchHistory = user.watchHistory.filter(item => item.videoId !== videoId);

    // Add to the beginning
    user.watchHistory.unshift({
      videoId,
      title,
      channelTitle: channelTitle || 'Unknown Channel',
      watchedAt: new Date()
    });

    // Limit to 50 videos
    if (user.watchHistory.length > 50) {
      user.watchHistory = user.watchHistory.slice(0, 50);
    }

    await user.save();

    res.json({ message: 'History updated', history: user.watchHistory });
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
