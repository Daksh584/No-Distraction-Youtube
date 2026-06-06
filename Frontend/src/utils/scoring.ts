import type { YouTubeSearchItem } from "@/types";

// Helper to convert ISO 8601 duration (e.g., PT1H3M20S) to minutes
export function parseISODurationToMinutes(duration: string): number {
  if (!duration) return 0;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 60 + minutes + seconds / 60;
}

// Minimum score to display a video (-20 or below gets hidden)
export const SCORE_THRESHOLD = -20;

export function calculateEducationalScore(video: YouTubeSearchItem): number {
  let score = 0;

  const title = video.snippet.title.toLowerCase();

  // Positive keywords
  const positiveKeywords = [
    "tutorial",
    "course",
    "learn",
    "explained",
    "guide",
    "lecture",
    "roadmap",
    "bootcamp",
    "introduction",
    "interview",
  ];

  positiveKeywords.forEach((keyword) => {
    if (title.includes(keyword)) score += 10;
  });

  // Duration modifiers
  if (video.durationMinutes && video.durationMinutes > 20) score += 15;
  if (video.durationMinutes && video.durationMinutes > 60) score += 10;
  if (video.durationMinutes && video.durationMinutes < 3) score -= 40;

  // Educational category (YouTube category IDs: 27=Education, 28=Science & Technology)
  if (video.categoryId === "27" || video.categoryId === "28") score += 20;

  // Engagement ratio: high like-to-view ratio = helpful content
  if (video.likeCount && video.viewCount && video.viewCount > 0) {
    const ratio = video.likeCount / video.viewCount;
    if (ratio > 0.04) score += 15;      // >4% like ratio = excellent
    else if (ratio > 0.02) score += 5;  // >2% = decent
  }

  // Penalties — expanded negative keywords
  const negativeKeywords = [
    { word: "prank", penalty: -50 },
    { word: "reaction", penalty: -30 },
    { word: "vlog", penalty: -20 },
    { word: "unboxing", penalty: -20 },
    { word: "asmr", penalty: -30 },
    { word: "mukbang", penalty: -30 },
    { word: "drama", penalty: -25 },
    { word: "roast", penalty: -25 },
    { word: "#shorts", penalty: -40 },
  ];

  negativeKeywords.forEach(({ word, penalty }) => {
    if (title.includes(word)) score += penalty;
  });

  return score;
}

// Returns a color class based on the score
export function getScoreColor(score: number): string {
  if (score >= 30) return "text-emerald-400 border-emerald-400/30 bg-emerald-500/10";
  if (score >= 0) return "text-amber-400 border-amber-400/30 bg-amber-500/10";
  return "text-red-400 border-red-400/30 bg-red-500/10";
}
