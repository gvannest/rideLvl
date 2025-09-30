/**
 * Convert radians to degrees
 */
export function deg(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Clamp a number between two values
 */
export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/**
 * Calculate the torso vector from pose landmarks
 */
export function torsoVector(landmarks) {
  if (!landmarks || landmarks.length < 33) return null;

  const L_SHOULDER = 11;
  const R_SHOULDER = 12;
  const L_HIP = 23;
  const R_HIP = 24;

  const shoulders = {
    x: (landmarks[L_SHOULDER].x + landmarks[R_SHOULDER].x) / 2,
    y: (landmarks[L_SHOULDER].y + landmarks[R_SHOULDER].y) / 2,
  };

  const hips = {
    x: (landmarks[L_HIP].x + landmarks[R_HIP].x) / 2,
    y: (landmarks[L_HIP].y + landmarks[R_HIP].y) / 2,
  };

  return {
    x: shoulders.x - hips.x,
    y: shoulders.y - hips.y
  };
}

/**
 * Calculate angle between two vectors
 */
export function angleBetween(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.hypot(v1.x, v1.y);
  const mag2 = Math.hypot(v2.x, v2.y);

  if (mag1 === 0 || mag2 === 0) return null;

  const cos = dot / (mag1 * mag2);
  return deg(Math.acos(clamp(cos, -1, 1)));
}

/**
 * Get pose connections for drawing skeleton
 * Based on MediaPipe POSE_CONNECTIONS
 */
export function getPoseConnections() {
  return [
    // Face
    [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
    [9, 10],

    // Torso
    [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
    [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
    [11, 23], [12, 24], [23, 24],

    // Arms
    [17, 19], [18, 20],

    // Legs
    [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
    [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
  ];
}