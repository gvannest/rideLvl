import PosePlayer from './PosePlayer';

const VideoCard = ({ video }) => {
  const { metrics } = video;

  // If metrics are not available yet, don't render the card
  if (!metrics) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Video Player */}
      <PosePlayer url={video.url} name={video.name} />

      {/* Metrics Section */}
      <div className="p-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.speedKmh}</div>
            <div className="text-sm text-gray-600">km/h</div>
            <div className="text-xs text-gray-500">Speed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.overall}</div>
            <div className="text-sm text-gray-600">/100</div>
            <div className="text-xs text-gray-500">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.technical}</div>
            <div className="text-sm text-gray-600">/100</div>
            <div className="text-xs text-gray-500">Technical Score</div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Positive Points */}
          <div>
            <h3 className="font-semibold text-green-700 mb-3 flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Strengths
            </h3>
            <ul className="space-y-2">
              {metrics.positives.map((positive, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">•</span>
                  {positive}
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div>
            <h3 className="font-semibold text-orange-700 mb-3 flex items-center">
              <span className="text-orange-500 mr-2">⚡</span>
              Areas to Improve
            </h3>
            <ul className="space-y-2">
              {metrics.improvements.map((improvement, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-orange-400 mr-2 mt-0.5">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;