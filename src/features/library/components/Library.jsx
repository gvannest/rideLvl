import { useState, useEffect } from 'react';
import VideoCard from './VideoCard';
import { LoadingCard } from '../../../components';

const Library = ({ videos, onDeleteVideo }) => {
  // Find processing video (if any)
  const processingVideo = videos.find((video) => video.isProcessing);

  // Get completed videos sorted by most recent first
  const completedVideos = videos
    .filter((video) => !video.isProcessing)
    .sort((a, b) => {
      // Sort by processingStartTime (most recent first)
      return (b.processingStartTime || 0) - (a.processingStartTime || 0);
    });

  // Track which video is expanded (first one by default)
  const [expandedVideoId, setExpandedVideoId] = useState(null);

  // Always expand the most recent (first) video when it changes
  useEffect(() => {
    if (completedVideos.length > 0) {
      const firstVideoId = completedVideos[0].id;
      // If the first video is different from currently expanded, expand it
      if (expandedVideoId !== firstVideoId) {
        setExpandedVideoId(firstVideoId);
      }
    }
  }, [completedVideos, expandedVideoId]);

  if (!videos || videos.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <div className="text-6xl mb-4">🎿</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          No videos yet
        </h2>
        <p className="text-gray-600 mb-8">
          Upload your first skiing video to start analyzing your technique
        </p>
        <div className="text-sm text-gray-500">
          Your uploaded videos will appear here with AI-powered pose analysis
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Video Library
          </h1>
          <p className="text-gray-600">
            {completedVideos.length} video{completedVideos.length !== 1 ? 's' : ''} with pose analysis
          </p>
        </div>

        <div className="grid gap-4">
          {completedVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isExpanded={expandedVideoId === video.id}
              onToggle={() => setExpandedVideoId(video.id)}
              onDelete={onDeleteVideo}
            />
          ))}
        </div>
      </div>

      {/* Processing Modal */}
      {processingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <LoadingCard
              videoName={processingVideo.name}
              startTime={processingVideo.processingStartTime}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Library;