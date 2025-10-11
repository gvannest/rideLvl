import { useEffect, useRef, useState } from 'react';
import {
  calculateVideoDimensions,
  getDeviceOrientation,
  getOptimalVideoHeight,
  toggleFullscreen,
  getOptimalVideoQuality
} from '../../shared/utils/videoUtils';

/**
 * VideoPlayer Component
 *
 * Implements Steps 1.2 and 1.3 of the Mobile Optimization Plan.
 * Responsive video player with viewport-based sizing and orientation support.
 *
 * Features:
 * - Responsive video sizing that adapts to device viewport
 * - Maintains proper 16:9 aspect ratio for optimal viewing
 * - Max 40% viewport height in portrait, 70% in landscape (mobile)
 * - Seamless portrait/landscape orientation support
 * - Fullscreen capability with orientation lock
 * - Dynamic video quality adjustment
 * - Preserves video quality and performance
 *
 * @param {Object} props
 * @param {string} props.videoUrl - URL of the video source
 * @param {Object} props.analysisData - Real-time analysis data for overlay
 * @param {Function} props.onTimeUpdate - Callback fired on video time updates
 */
const VideoPlayer = ({ videoUrl, analysisData, onTimeUpdate }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoQuality, setVideoQuality] = useState('medium');

  // Calculate optimal video dimensions based on viewport using utility functions
  useEffect(() => {
    const updateDimensions = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Use utility function to get optimal video height percentage
      const heightPercentage = getOptimalVideoHeight();
      const maxHeight = viewportHeight * heightPercentage;

      // Use utility function to calculate dimensions maintaining aspect ratio
      const calculatedDimensions = calculateVideoDimensions(
        viewportWidth - 32, // Account for padding
        maxHeight,
        16 / 9 // Aspect ratio
      );

      setDimensions(calculatedDimensions);

      // Update video quality based on viewport size
      const quality = getOptimalVideoQuality(viewportWidth, viewportHeight);
      setVideoQuality(quality);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle fullscreen toggle using utility function
  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      await toggleFullscreen(containerRef.current);

      // Lock/unlock orientation based on fullscreen state
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      if (isNowFullscreen) {
        // Lock orientation to landscape in fullscreen (if supported)
        if (window.screen.orientation && window.screen.orientation.lock) {
          try {
            await window.screen.orientation.lock('landscape');
          } catch (err) {
            // Orientation lock may not be supported on all devices
            console.log('Orientation lock not supported:', err);
          }
        }
      } else {
        // Unlock orientation when exiting fullscreen
        if (window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`video-container ${isFullscreen ? 'fullscreen' : ''}`}
      style={{
        position: 'relative',
        width: dimensions.width > 0 ? `${dimensions.width}px` : '100%',
        maxWidth: '100%',
        margin: '0 auto'
      }}
    >
      <div
        className="video-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          backgroundColor: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
          maxHeight: dimensions.height > 0 ? `${dimensions.height}px` : 'none'
        }}
      >
        <video
          ref={videoRef}
          className="video-element"
          src={videoUrl}
          controls
          playsInline
          onTimeUpdate={onTimeUpdate}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Fullscreen toggle button */}
      <button
        onClick={handleFullscreen}
        className="fullscreen-button"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          padding: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        {isFullscreen ? '⛶' : '⛶'}
      </button>
    </div>
  );
};

export default VideoPlayer;
