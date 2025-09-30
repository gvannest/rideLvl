import { useRef, useEffect } from 'react';
import { usePoseDetection } from '../hooks/usePoseDetection';

const PosePlayer = ({ url, name }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { startDetection, stopDetection, leanAngle, slopeAngle } = usePoseDetection();

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const handlePlay = () => {
      startDetection(video, canvas);
    };

    const handlePause = () => {
      stopDetection();
    };

    const handleEnded = () => {
      stopDetection();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      stopDetection();
    };
  }, [startDetection, stopDetection]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={url}
        controls
        playsInline
        className="w-full h-auto block"
        preload="metadata"
      />

      {/* Pose Overlay Canvas - positioned absolutely over the video */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      />

      {/* Angle Display */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-3 text-xs rounded-lg shadow-lg">
        <div className="font-semibold mb-1 text-gray-800">Real-time Analysis</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Lean angle:</span>
            <span className="font-mono font-semibold text-blue-600">
              {leanAngle !== null ? `${leanAngle}°` : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Slope angle:</span>
            <span className="font-mono font-semibold text-green-600">
              {slopeAngle !== null ? `${slopeAngle}°` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Video Name */}
      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 text-sm rounded">
        {name}
      </div>
    </div>
  );
};

export default PosePlayer;