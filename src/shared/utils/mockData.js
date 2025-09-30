/**
 * Pick a random element from an array
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle an array randomly
 */
function shuffled(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * Generate mock metrics for a ski video
 */
export function generateMockMetrics() {
  const speeds = [46, 53, 61, 68, 72, 79, 84, 91];

  const positives = [
    "Good balance through turns",
    "Forward pressure on skis",
    "Stable upper body",
    "Smooth edge transitions",
    "Centered stance",
    "Consistent rhythm",
  ];

  const improvements = [
    "Earlier edge engagement",
    "Increase angulation",
    "Hands a bit wider",
    "Finish turns stronger",
    "Look further downhill",
    "More pressure on the outside ski",
  ];

  return {
    speedKmh: pick(speeds),
    overall: 60 + Math.floor(Math.random() * 40),
    technical: 50 + Math.floor(Math.random() * 50),
    positives: shuffled(positives).slice(0, 3),
    improvements: shuffled(improvements).slice(0, 3),
  };
}