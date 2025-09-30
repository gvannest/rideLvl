import { generateMockMetrics } from "../../../shared/utils";

/**
 * Process uploaded video file and create video item
 */
export function processVideoFile(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!file.type.startsWith('video/')) {
    throw new Error('File must be a video');
  }

  // Create object URL for the video
  const url = URL.createObjectURL(file);

  // Generate unique ID
  const id = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create video item WITHOUT metrics initially (they'll be added after processing)
  const videoItem = {
    id,
    name: file.name,
    url,
    metrics: null, // Will be populated after processing
    uploadedAt: new Date().toISOString(),
    isProcessing: true, // Flag to indicate processing state
    processingStartTime: Date.now(),
  };

  return videoItem;
}

/**
 * Simulate video processing and analysis
 * Returns a promise that resolves with metrics after a delay
 */
export async function processVideoAnalysis(videoId, delay = null) {
  // Random delay between 6-9 seconds if not specified
  const processingTime = delay || (6000 + Math.random() * 3000);

  return new Promise((resolve) => {
    setTimeout(() => {
      const metrics = generateMockMetrics();
      resolve(metrics);
    }, processingTime);
  });
}

/**
 * Validate video file before processing
 */
export function validateVideoFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No file selected');
    return errors;
  }

  if (!file.type.startsWith('video/')) {
    errors.push('File must be a video');
  }

  // Check file size (limit to 100MB for demo)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 100MB');
  }

  return errors;
}

/**
 * Cleanup video object URL to prevent memory leaks
 */
export function cleanupVideoUrl(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}