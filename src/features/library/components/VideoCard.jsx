import { useState } from 'react';
import PosePlayer from './PosePlayer';

const VideoCard = ({ video, onDelete }) => {
  const { metrics } = video;
  const [isExpanded, setIsExpanded] = useState(false);

  // If metrics are not available yet, don't render the card
  if (!metrics) {
    return null;
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${video.name}"?`)) {
      onDelete(video.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Video Player */}
      <PosePlayer url={video.url} name={video.name} />

      {/* Metrics Section */}
      <div className="p-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center justify-center py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span className="mr-2">Details</span>
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="flex items-center justify-center py-2 px-4 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            title="Delete video"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="ml-1">Delete</span>
          </button>
        </div>

        {/* Collapsible Feedback Section */}
        {isExpanded && (
          <div className="grid md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-200">
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
        )}
      </div>
    </div>
  );
};

export default VideoCard;