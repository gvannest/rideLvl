import { useState, useCallback } from 'react';
import { Header } from './components';
import { Upload, processVideoAnalysis } from './features/upload';
import { Library } from './features/library';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [videos, setVideos] = useState([]);

  const handleVideoAdded = useCallback((newVideo) => {
    // Add the video immediately (in processing state)
    setVideos((prevVideos) => [newVideo, ...prevVideos]);
    // Switch to library tab to show the processing video
    setActiveTab('library');

    // Start processing the video analysis
    processVideoAnalysis(newVideo.id).then((metrics) => {
      // Update the video with metrics when processing is complete
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === newVideo.id
            ? { ...video, metrics, isProcessing: false }
            : video
        )
      );
    });
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <main className="px-4 py-8">
        {activeTab === 'upload' ? (
          <Upload onVideoAdded={handleVideoAdded} />
        ) : (
          <Library videos={videos} />
        )}
      </main>
    </div>
  );
}

export default App;