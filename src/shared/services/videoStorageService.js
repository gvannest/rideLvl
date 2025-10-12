const DB_NAME = 'rideLvl_db';
const DB_VERSION = 1;
const VIDEOS_STORE = 'videos';

/**
 * Initialize IndexedDB
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create videos object store if it doesn't exist
      if (!db.objectStoreNames.contains(VIDEOS_STORE)) {
        db.createObjectStore(VIDEOS_STORE, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Convert blob URL to actual Blob object
 */
const blobUrlToBlob = async (blobUrl) => {
  try {
    const response = await fetch(blobUrl);
    return await response.blob();
  } catch (error) {
    console.error('Error converting blob URL to blob:', error);
    return null;
  }
};

/**
 * Save videos to IndexedDB
 */
export const saveVideos = async (videos) => {
  try {
    // First, convert all blob URLs to actual blobs BEFORE opening transaction
    const videosWithBlobs = await Promise.all(
      videos.map(async (video) => ({
        ...video,
        videoBlob: await blobUrlToBlob(video.url),
        thumbnailBlob: video.thumbnail ? await blobUrlToBlob(video.thumbnail) : null,
      }))
    );

    // Now open the transaction and store all videos
    const db = await initDB();
    const transaction = db.transaction([VIDEOS_STORE], 'readwrite');
    const store = transaction.objectStore(VIDEOS_STORE);

    // Store each video (synchronously now that we have the blobs)
    for (const video of videosWithBlobs) {
      const videoToStore = { ...video };

      // Remove the blob URLs (we'll recreate them on load)
      delete videoToStore.url;
      delete videoToStore.thumbnail;

      store.put(videoToStore);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error saving videos to IndexedDB:', error);
  }
};

/**
 * Load videos from IndexedDB
 */
export const loadVideos = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([VIDEOS_STORE], 'readonly');
    const store = transaction.objectStore(VIDEOS_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const videos = request.result.map((video) => ({
          ...video,
          url: video.videoBlob ? URL.createObjectURL(video.videoBlob) : '',
          thumbnail: video.thumbnailBlob ? URL.createObjectURL(video.thumbnailBlob) : null,
        }));

        db.close();
        resolve(videos);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error loading videos from IndexedDB:', error);
    return [];
  }
};

/**
 * Delete a specific video from IndexedDB
 */
export const deleteVideo = async (videoId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([VIDEOS_STORE], 'readwrite');
    const store = transaction.objectStore(VIDEOS_STORE);

    store.delete(videoId);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error deleting video from IndexedDB:', error);
  }
};

/**
 * Clear all videos from IndexedDB
 */
export const clearAllVideos = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([VIDEOS_STORE], 'readwrite');
    const store = transaction.objectStore(VIDEOS_STORE);

    store.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error clearing videos from IndexedDB:', error);
  }
};
