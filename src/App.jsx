import { useState, useCallback, useEffect } from 'react';
import { Header, MobileNav } from './components';
import { Upload, processVideoAnalysis } from './features/upload';
import { Library } from './features/library';
import { loadVideos, saveVideos, deleteVideo } from './shared/services/videoStorageService';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [videos, setVideos] = useState([]);

  // Load videos from IndexedDB on mount
  useEffect(() => {
    const loadStoredVideos = async () => {
      const storedVideos = await loadVideos();
      setVideos(storedVideos);
    };
    loadStoredVideos();
  }, []);

  // Save videos to IndexedDB whenever they change
  useEffect(() => {
    if (videos.length > 0) {
      saveVideos(videos);
    }
  }, [videos]);

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

  const handleDeleteVideo = useCallback(async (videoId) => {
    // Remove from IndexedDB
    await deleteVideo(videoId);
    // Update state
    setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));
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

      <main className="px-4 py-8 pb-20 md:pb-8">
        {activeTab === 'upload' ? (
          <Upload onVideoAdded={handleVideoAdded} />
        ) : (
          <Library videos={videos} onDeleteVideo={handleDeleteVideo} />
        )}
      </main>

      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}

export default App;