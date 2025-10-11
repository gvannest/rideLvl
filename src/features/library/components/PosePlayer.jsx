import { useRef, useEffect, useState, useCallback } from 'react';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { ResponsiveVideoContainer } from '../../../components/VideoPlayer';
import VideoControls from '../../../components/VideoPlayer/VideoControls';
import { toggleFullscreen } from '../../../shared/utils/videoUtils';

const PosePlayer = ({ url, name }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const {
    initializeMediaPipe,
    startDetection,
    stopDetection,
    leanAngle,
    slopeAngle,
    isReady,
    isInitializing
  } = usePoseDetection();
  const containerDimensionsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const hideControlsTimeoutRef = useRef(null);
  const progressBarRef = useRef(null);

  const handleContainerResize = useCallback((dimensions) => {
    const canvas = canvasRef.current;
    if (canvas && dimensions) {
      // Only update if dimensions actually changed
      const prev = containerDimensionsRef.current;
      if (!prev || prev.width !== dimensions.width || prev.height !== dimensions.height) {
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        containerDimensionsRef.current = dimensions;
      }
    }
  }, []);

  // Initialize MediaPipe when component mounts
  useEffect(() => {
    initializeMediaPipe();
  }, [initializeMediaPipe]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const handlePlay = async () => {
      // Prevent playback if MediaPipe not ready
      if (!isReady) {
        console.warn('⚠️ MediaPipe not ready, pausing video...');
        video.pause();
        return;
      }
      startDetection(video, canvas);
      setIsPlaying(true);
    };

    const handlePause = () => {
      stopDetection();
      setIsPlaying(false);
    };

    const handleEnded = () => {
      stopDetection();
      setIsPlaying(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      stopDetection();
    };
  }, [startDetection, stopDetection, isReady, initializeMediaPipe]);

  // Auto-hide controls functionality
  const resetHideControlsTimeout = useCallback(() => {
    setShowControls(true);

    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    // Only auto-hide if playing and not scrubbing
    if (isPlaying && !isScrubbing) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000); // Hide after 1 second of inactivity
    }
  }, [isPlaying, isScrubbing]);

  // Control handlers
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
    resetHideControlsTimeout();
  };

  const handleSeek = (seconds) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    resetHideControlsTimeout();
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      await toggleFullscreen(containerRef.current);
      resetHideControlsTimeout();
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleScrubbingStart = () => {
    setIsScrubbing(true);
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
  };

  const handleScrubbingEnd = () => {
    setIsScrubbing(false);
    resetHideControlsTimeout();
  };

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !videoRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    resetHideControlsTimeout();
  };

  const handleProgressTouch = (e) => {
    handleScrubbingStart();

    const touch = e.touches[0];
    if (!progressBarRef.current || !videoRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (touch.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(duration, pos * duration));

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressTouchEnd = () => {
    handleScrubbingEnd();
  };

  // Reset timeout when playback state changes
  useEffect(() => {
    resetHideControlsTimeout();
  }, [isPlaying, resetHideControlsTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideControlsTimeout}
      onTouchStart={resetHideControlsTimeout}
      onTouchMove={resetHideControlsTimeout}
    >
      <ResponsiveVideoContainer
        className="bg-black"
        onResize={handleContainerResize}
      >
        {/* Video Element - removed native controls */}
        <video
          ref={videoRef}
          src={url}
          playsInline
          className="w-full h-full block object-contain"
          preload="metadata"
          onClick={handlePlayPause}
        />

        {/* Pose Overlay Canvas - positioned absolutely over the video */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 10 }}
        />

        {/* Loading Indicator - Center overlay */}
        {isInitializing && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 30 }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
              <div className="text-white/90 text-sm font-medium">Loading pose detection...</div>
            </div>
          </div>
        )}

        {/* Real-time Analysis - Top-left corner */}
        <div
          className="absolute top-2 left-2 bg-black/60 px-3 py-2 text-xs rounded-lg backdrop-blur-sm"
          style={{
            zIndex: 20
          }}
        >
          <div className="flex flex-col gap-1.5 text-white/90">
            {/* Title only visible on desktop (hidden on mobile) */}
            <div className="font-semibold text-white/95 mb-0.5 hidden md:block">
              {isInitializing ? 'Initializing...' : 'Real time angles'}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/70">Lean:</span>
              <span className="font-mono font-semibold text-green-400">
                {leanAngle !== null ? `${leanAngle}°` : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/70">Slope:</span>
              <span className="font-mono font-semibold text-orange-400">
                {slopeAngle !== null ? `${slopeAngle}°` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Custom Video Controls with integrated progress bar */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-opacity duration-300"
          style={{
            zIndex: 30,
            opacity: showControls ? 1 : 0,
            pointerEvents: showControls ? 'auto' : 'none'
          }}
        >
          {/* Dark gradient background overlay */}
          <div className="relative bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-1 md:pt-3 pb-1 md:pb-2 px-4 rounded-t-xl">
            {/* Video filename at the top of control pane */}

            <VideoControls
              videoRef={videoRef}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onFullscreen={handleFullscreen}
              onScrubbingStart={handleScrubbingStart}
              onScrubbingEnd={handleScrubbingEnd}
              showProgressBar={false}
              disabled={!isReady}
            />

            <div className="text-white/80 text-xs mb-0.5 md:mb-2 truncate">
              {name}
            </div>
            {/* Progress Bar - At the very bottom of the dark overlay */}
            <div className="mt-0 md:mt-1">
              <div
                ref={progressBarRef}
                className="relative w-full h-8 flex items-center cursor-pointer"
                onClick={handleProgressClick}
                onTouchMove={handleProgressTouch}
                onTouchEnd={handleProgressTouchEnd}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-1.5 bg-white/25 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-100 shadow-lg shadow-green-500/40"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <div
                    className="absolute w-4 h-4 bg-white rounded-full shadow-lg transform -translate-x-1/2 transition-all duration-100"
                    style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveVideoContainer>
    </div>
  );
};

export default PosePlayer;