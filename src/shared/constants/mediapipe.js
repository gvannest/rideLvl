export const MEDIAPIPE_CONFIG = {
  WASM_URL: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  MODEL_URL: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
  RUNNING_MODE: "VIDEO",
  NUM_POSES: 1,
};

export const POSE_LANDMARKS = {
  L_SHOULDER: 11,
  R_SHOULDER: 12,
  L_HIP: 23,
  R_HIP: 24,
  L_ELBOW: 13,
  R_ELBOW: 14,
  L_WRIST: 15,
  R_WRIST: 16,
  L_KNEE: 25,
  R_KNEE: 26,
  L_ANKLE: 27,
  R_ANKLE: 28,
};

export const REFERENCE_VECTORS = {
  VERTICAL: { x: 0, y: 1 },
  SLOPE: { x: Math.cos(25 * Math.PI / 180), y: Math.sin(25 * Math.PI / 180) },
};