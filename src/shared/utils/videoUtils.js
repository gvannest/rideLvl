/**
 * Video Utility Functions
 *
 * Implements Step 1.3 of the Mobile Optimization Plan.
 * Provides dynamic video quality adjustment and dimension calculations.
 */

/**
 * Determines optimal video quality based on viewport size
 *
 * @param {number} viewportWidth - Current viewport width in pixels
 * @param {number} viewportHeight - Current viewport height in pixels
 * @returns {string} Quality preset: 'high', 'medium', or 'low'
 */
export const getOptimalVideoQuality = (viewportWidth, viewportHeight) => {
  const pixels = viewportWidth * viewportHeight;

  if (pixels > 1920 * 1080) {
    return 'high'; // Desktop/large tablet - 1080p+
  }
  if (pixels > 1280 * 720) {
    return 'medium'; // Tablet - 720p
  }
  return 'low'; // Mobile - 480p or lower
};

/**
 * Calculate video container dimensions maintaining aspect ratio
 *
 * @param {number} containerWidth - Available container width in pixels
 * @param {number} containerHeight - Available container height in pixels
 * @param {number} aspectRatio - Target aspect ratio (default 16/9)
 * @returns {Object} Calculated dimensions {width, height}
 */
export const calculateVideoDimensions = (
  containerWidth,
  containerHeight,
  aspectRatio = 16 / 9
) => {
  // Calculate dimensions based on width constraint
  const widthBasedHeight = containerWidth / aspectRatio;

  // Calculate dimensions based on height constraint
  const heightBasedWidth = containerHeight * aspectRatio;

  // Use width-based dimensions if they fit within height constraint
  if (widthBasedHeight <= containerHeight) {
    return {
      width: containerWidth,
      height: widthBasedHeight
    };
  } else {
    // Otherwise use height-based dimensions
    return {
      width: heightBasedWidth,
      height: containerHeight
    };
  }
};

/**
 * Get device orientation information
 *
 * @returns {Object} Orientation info {isPortrait, isLandscape, isMobile, type}
 */
export const getDeviceOrientation = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width < 768;
  const isLandscape = width > height;

  return {
    isPortrait: !isLandscape,
    isLandscape,
    isMobile,
    type: isLandscape ? 'landscape' : 'portrait'
  };
};

/**
 * Calculate optimal video player height based on device and orientation
 *
 * @returns {number} Optimal height as percentage of viewport (0-1)
 */
export const getOptimalVideoHeight = () => {
  const { isMobile, isLandscape } = getDeviceOrientation();

  if (isMobile && isLandscape) {
    return 0.7; // 70% in landscape mobile
  }
  if (isMobile) {
    return 0.4; // 40% in portrait mobile
  }
  return 0.6; // 60% on desktop
};

/**
 * Format video time for display (seconds to MM:SS or HH:MM:SS)
 *
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatVideoTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Check if fullscreen is supported
 *
 * @returns {boolean} True if fullscreen API is available
 */
export const isFullscreenSupported = () => {
  return !!(
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled
  );
};

/**
 * Request fullscreen on an element
 *
 * @param {HTMLElement} element - Element to make fullscreen
 * @returns {Promise} Resolves when fullscreen is entered
 */
export const requestFullscreen = async (element) => {
  if (!element) return Promise.reject(new Error('No element provided'));

  try {
    if (element.requestFullscreen) {
      return await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      return await element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      return await element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      return await element.msRequestFullscreen();
    }
  } catch (error) {
    console.error('Fullscreen request failed:', error);
    throw error;
  }
};

/**
 * Exit fullscreen mode
 *
 * @returns {Promise} Resolves when fullscreen is exited
 */
export const exitFullscreen = async () => {
  try {
    if (document.exitFullscreen) {
      return await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      return await document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      return await document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      return await document.msExitFullscreen();
    }
  } catch (error) {
    console.error('Exit fullscreen failed:', error);
    throw error;
  }
};

/**
 * Toggle fullscreen on an element
 *
 * @param {HTMLElement} element - Element to toggle fullscreen
 * @returns {Promise} Resolves when operation completes
 */
export const toggleFullscreen = async (element) => {
  const isFullscreen = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );

  if (isFullscreen) {
    return await exitFullscreen();
  } else {
    return await requestFullscreen(element);
  }
};
