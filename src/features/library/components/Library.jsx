import VideoCard from './VideoCard';
import { LoadingCard } from '../../../components';

const Library = ({ videos }) => {
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Video Library
        </h1>
        <p className="text-gray-600">
          {videos.length} video{videos.length !== 1 ? 's' : ''} with pose analysis
        </p>
      </div>

      <div className="grid gap-8">
        {videos.map((video) => (
          video.isProcessing ? (
            <LoadingCard
              key={video.id}
              videoName={video.name}
              startTime={video.processingStartTime}
            />
          ) : (
            <VideoCard key={video.id} video={video} />
          )
        ))}
      </div>
    </div>
  );
};

export default Library;