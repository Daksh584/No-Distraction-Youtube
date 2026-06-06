const express = require('express');
const router = express.Router();
const { YoutubeTranscript } = require('youtube-transcript');

// GET /api/transcript/:videoId
router.get('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Fetch transcript using lightweight youtube-transcript library
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (transcriptData && transcriptData.length > 0) {
      // Map to the format expected by the frontend (same as original Flask output)
      const transcript = transcriptData.map((segment) => ({
        text: segment.text,
        start: segment.offset / 1000,
        duration: segment.duration / 1000
      }));
      return res.json(transcript);
    } else {
      return res.status(404).json({ error: "No transcript segments found for this video." });
    }
  } catch (error) {
    console.error('Error fetching transcript:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
