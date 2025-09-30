import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { MEDIAPIPE_CONFIG } from "../../../shared/constants/mediapipe";

// Singleton instance to avoid recreating the landmarker
let landmarkerPromise = null;

/**
 * Get or create the MediaPipe PoseLandmarker instance
 */
export async function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      try {
        console.log('🎿 Initializing MediaPipe PoseLandmarker...');
        console.log('Loading from:', MEDIAPIPE_CONFIG.WASM_URL);

        const filesets = await FilesetResolver.forVisionTasks(
          MEDIAPIPE_CONFIG.WASM_URL
        );
        console.log('✅ FilesetResolver loaded successfully');

        const landmarker = await PoseLandmarker.createFromOptions(filesets, {
          baseOptions: {
            modelAssetPath: MEDIAPIPE_CONFIG.MODEL_URL,
          },
          runningMode: MEDIAPIPE_CONFIG.RUNNING_MODE,
          numPoses: MEDIAPIPE_CONFIG.NUM_POSES,
        });

        console.log('✅ PoseLandmarker created successfully');
        return landmarker;
      } catch (error) {
        console.error('❌ Failed to initialize MediaPipe PoseLandmarker:', error);
        console.error('Error details:', error.message, error.stack);
        throw error;
      }
    })();
  }

  return landmarkerPromise;
}

/**
 * Reset the landmarker instance (useful for cleanup or reinitialization)
 */
export function resetLandmarker() {
  landmarkerPromise = null;
}