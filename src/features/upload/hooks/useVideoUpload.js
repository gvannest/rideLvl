import { useState, useCallback } from 'react';
import { processVideoFile, validateVideoFile } from '../services/videoUploadService';

export function useVideoUpload(onVideoAdded) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadVideo = useCallback(async (file) => {
    setError(null);
    setIsUploading(true);

    try {
      // Validate file
      const validationErrors = validateVideoFile(file);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Process file (now async due to metadata extraction)
      const videoItem = await processVideoFile(file);

      // Call callback with new video item
      if (onVideoAdded) {
        onVideoAdded(videoItem);
      }

      return videoItem;
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload video';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [onVideoAdded]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadVideo,
    isUploading,
    error,
    clearError,
  };
}