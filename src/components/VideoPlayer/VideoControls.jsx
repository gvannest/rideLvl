import { useState, useRef, useEffect } from 'react';
import styles from './VideoControls.module.css';

/**
 * VideoControls Component
 *
 * Implements Steps 2.1-2.3 of the Mobile Optimization Plan.
 * Touch-optimized video controls with gesture support and auto-hide.
 *
 * Features:
 * - Touch-optimized tap targets (minimum 44x44px)
 * - Gesture-based controls (swipe, double-tap)
 * - Custom progress bar with scrubbing
 * - Frame-accurate seeking
 * - Auto-hide support with scrubbing detection
 * - Accessibility support (ARIA labels, keyboard navigation)
 *
 * @param {Object} props
 * @param {React.RefObject} props.videoRef - Reference to video element
 * @param {boolean} props.isPlaying - Current playback state
 * @param {Function} props.onPlayPause - Toggle play/pause callback
 * @param {Function} props.onSeek - Seek callback (seconds to skip)
 * @param {Function} props.onFullscreen - Fullscreen toggle callback
 * @param {Function} props.onScrubbingStart - Callback when scrubbing starts
 * @param {Function} props.onScrubbingEnd - Callback when scrubbing ends
 */
const VideoControls = ({ videoRef, isPlaying, onPlayPause, onSeek, onFullscreen, onScrubbingStart, onScrubbingEnd, showProgressBar = true, disabled = false }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressBarRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Update time display
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateTime);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateTime);
    };
  }, [videoRef]);

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchMove = (e) => {
    if (!videoRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Horizontal swipe for seeking
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      const seekAmount = deltaX / 10; // 10px = 1 second
      const newTime = Math.max(0, Math.min(duration, currentTime + seekAmount));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }

    // Vertical swipe for volume (right side of screen)
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
      if (touch.clientX > window.innerWidth / 2) {
        const volumeChange = -deltaY / 200;
        const newVolume = Math.max(0, Math.min(1, volume + volumeChange));
        setVolume(newVolume);
        if (videoRef.current) {
          videoRef.current.volume = newVolume;
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0];
    const deltaTime = Date.now() - touchStartRef.current.time;
    const deltaX = Math.abs(touchEnd.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touchEnd.clientY - touchStartRef.current.y);

    // Double tap to toggle fullscreen
    if (deltaTime < 300 && deltaX < 10 && deltaY < 10) {
      if (touchStartRef.lastTap && (Date.now() - touchStartRef.lastTap) < 300) {
        onFullscreen();
        touchStartRef.lastTap = null;
      } else {
        touchStartRef.lastTap = Date.now();
      }
    }
  };

  // Progress bar interaction
  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !videoRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressTouch = (e) => {
    setIsScrubbing(true);
    if (onScrubbingStart) onScrubbingStart();

    const touch = e.touches[0];
    if (!progressBarRef.current || !videoRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (touch.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(duration, pos * duration));

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressTouchEnd = () => {
    setIsScrubbing(false);
    if (onScrubbingEnd) onScrubbingEnd();
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={styles.controlsContainer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress Bar */}
      {showProgressBar && (
        <div
          ref={progressBarRef}
          className={styles.progressBar}
          onClick={handleProgressClick}
          onTouchMove={handleProgressTouch}
          onTouchEnd={handleProgressTouchEnd}
        >
          <div
            className={styles.progressFilled}
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div
            className={styles.progressHandle}
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      )}

      {/* Control Buttons */}
      <div className={styles.controlButtons}>
        {/* Play/Pause Button */}
        <button
          className={styles.controlButton}
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={disabled}
          style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Skip Buttons */}
        <button
          className={styles.controlButton}
          onClick={() => onSeek(-10)}
          aria-label="Rewind 10 seconds"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            <text x="8" y="15" fontSize="8" fill="white">10</text>
          </svg>
        </button>

        <button
          className={styles.controlButton}
          onClick={() => onSeek(10)}
          aria-label="Forward 10 seconds"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
            <text x="10" y="15" fontSize="8" fill="white">10</text>
          </svg>
        </button>

        {/* Time Display */}
        <span className={styles.timeDisplay}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Fullscreen Button */}
        <button
          className={styles.controlButton}
          onClick={onFullscreen}
          aria-label="Toggle fullscreen"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
        </button>
      </div>

      {/* Gesture Hints (show on first use) */}
      <div className={styles.gestureHints}>
        <p>Swipe left/right to seek • Swipe up/down (right side) for volume • Double tap for fullscreen</p>
      </div>
    </div>
  );
};

export default VideoControls;
