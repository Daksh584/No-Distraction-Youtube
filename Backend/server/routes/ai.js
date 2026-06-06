const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

// GET /api/ai/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const history = user.watchHistory || [];

    // No history at all — return a generic welcome
    if (history.length === 0) {
      return res.json({
        welcomeMessage: "Welcome to EduTube! 🎓 Search for a topic you want to learn and start your distraction-free study journey.",
        recommendations: [],
        lastWatched: null,
        cached: false,
      });
    }

    // Check if we have a fresh cache
    const now = new Date();
    const isCacheValid =
      user.lastAiGeneration &&
      user.aiWelcomeMessage &&
      now - new Date(user.lastAiGeneration) < CACHE_DURATION_MS;

    if (isCacheValid) {
      return res.json({
        welcomeMessage: user.aiWelcomeMessage,
        recommendations: user.aiRecommendations || [],
        lastWatched: history[0],
        cached: true,
      });
    }

    // Generate fresh AI response
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      // Fallback if no API key
      return res.json({
        welcomeMessage: `Welcome back! You last studied "${history[0].title}". Keep up the great work! 🚀`,
        recommendations: [],
        lastWatched: history[0],
        cached: false,
      });
    }

    const recentVideos = history.slice(0, 5);
    const videoList = recentVideos
      .map((v, i) => `${i + 1}. "${v.title}" by ${v.channelTitle}`)
      .join('\n');

    const prompt = `You are EduTube's AI study companion. A student named "${user.name}" has been studying on the platform.

Here are their recently watched videos:
${videoList}

Please respond in EXACTLY this JSON format (no markdown, no code fences, just raw JSON):
{
  "welcomeMessage": "A short, casual, motivating 1-2 sentence welcome message referencing what they've been learning. Use 1-2 emojis. Address them by name.",
  "recommendations": ["search query 1", "search query 2", "search query 3"]
}

The recommendations should be 3 highly specific YouTube search queries for educational videos that would naturally follow from what they've been studying. Each query should be 3-6 words long and focus on tutorials/courses.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    let responseText = null;

    const models = ['gemma-4-26b', 'gemma-4-31b', 'gemini-3.5-flash', 'gemini-3.1-flash', 'gemini-2.5-flash'];
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        break;
      } catch (modelError) {
        console.warn(`Model ${modelName} failed, trying next... Error:`, modelError.message);
        continue;
      }
    }

    if (!responseText) {
      // All models failed — return fallback
      return res.json({
        welcomeMessage: `Welcome back, ${user.name}! You've been making great progress. Keep it up! 🔥`,
        recommendations: [],
        lastWatched: history[0],
        cached: false,
      });
    }

    // Parse the JSON response
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return res.json({
        welcomeMessage: `Welcome back, ${user.name}! You were diving into "${history[0].title}". Ready to continue? 🎯`,
        recommendations: [],
        lastWatched: history[0],
        cached: false,
      });
    }

    // Cache the result in MongoDB
    user.aiWelcomeMessage = parsed.welcomeMessage || `Welcome back, ${user.name}! 🚀`;
    user.aiRecommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 3) : [];
    user.lastAiGeneration = now;
    await user.save();

    return res.json({
      welcomeMessage: user.aiWelcomeMessage,
      recommendations: user.aiRecommendations,
      lastWatched: history[0],
      cached: false,
    });

  } catch (error) {
    console.error('Error in AI dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
