import { useRef, useState } from 'react';
import { Button } from '../../../components';
import { useVideoUpload } from '../hooks/useVideoUpload';

const Upload = ({ onVideoAdded }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const { uploadVideo, isUploading, error, clearError } = useVideoUpload(onVideoAdded);

  const handleFileSelect = async (file) => {
    if (!file) return;

    try {
      await uploadVideo(file);
      // Clear the input to allow the same file to be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Your Skiing Video
        </h1>
        <p className="text-gray-600 mb-8">
          Upload a video to analyze your skiing technique with AI-powered pose estimation
        </p>

        {/* Upload Area */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 transition-colors
            ${dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
            }
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleInputChange}
            disabled={isUploading}
          />

          <div className="flex flex-col items-center">
            <div className="text-4xl mb-4">🎿</div>

            <Button
              onClick={handleButtonClick}
              size="lg"
              className="mb-4"
            >
              Select Video File
            </Button>
            <p className="text-sm text-gray-500">
              or drag and drop a video file here
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports MP4, WebM, MOV • Max file size: 100MB
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;