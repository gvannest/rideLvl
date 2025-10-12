# RideLvl - Application Overview for LLM Context

## Purpose
Real-time skiing pose analysis application using MediaPipe AI for body posture tracking and technique improvement.

## Tech Stack
- **Frontend**: React 18.2
- **AI/ML**: MediaPipe Tasks Vision 0.10.8 (Google's pose detection)
- **Styling**: Tailwind CSS 3.3
- **Build**: Create React App

## Core Functionality

### 1. Video Upload Feature
**Location**: `src/features/upload/`

- Drag-and-drop or file selection interface
- Client-side video processing
- Automatic switch to library after upload
- Mock processing simulation (creates placeholder metrics)

**Key Files**:
- `Upload.jsx` - Upload UI component
- `useVideoUpload.js` - Upload state management hook
- `videoUploadService.js` - File handling service

### 2. Video Library & Playback
**Location**: `src/features/library/`

- Grid display of analyzed videos
- Real-time pose overlay during playback
- Live angle calculations displayed on video

**Key Files**:
- `Library.jsx` - Video grid display
- `VideoCard.jsx` - Individual video preview
- `PosePlayer.jsx` - Video player with pose overlay (244 lines)

### 3. MediaPipe Pose Detection
**Technology**: Google MediaPipe PoseLandmarker

**How It Works**:
1. Detects 33 body landmarks (keypoints) in 3D space
2. Each landmark has x, y, z coordinates and visibility score
3. Processes video frames at ~60fps using requestAnimationFrame
4. Calculates angles from landmark positions
5. Draws color-coded skeleton overlay on canvas

**Key Files**:
- `mediapipeService.js` - Singleton MediaPipe initialization
- `usePoseDetection.js` - React hook managing detection loop
- `poseCalculations.js` - Math utilities for angle calculations

**Landmark Groups**:
- 0-10: Face (nose, eyes, ears)
- 11-16: Upper body (shoulders, elbows, wrists)
- 23-32: Lower body (hips, knees, ankles, feet)

### 4. Angle Calculations

**Lean Angle** (vertical alignment):
- Calculated from torso vector vs. vertical reference
- Shows forward/backward lean
- 0° = perfectly vertical

**Slope Angle** (terrain adaptation):
- Calculated from torso vector vs. slope reference (30° default)
- Shows body alignment with terrain

**Math Process**:
```
1. Find shoulder midpoint: (left_shoulder + right_shoulder) / 2
2. Find hip midpoint: (left_hip + right_hip) / 2
3. Torso vector = shoulders_midpoint - hips_midpoint
4. Calculate angle between torso and reference vectors
```

## Architecture Pattern

### Feature-Based Structure
```
src/
├── components/          # Reusable UI (Button, Header, LoadingCard)
├── features/           # Feature modules (upload, library)
│   └── [feature]/
│       ├── components/  # Feature-specific UI
│       ├── hooks/       # Business logic
│       └── services/    # External integrations
└── shared/             # Cross-cutting concerns
    ├── constants/       # MediaPipe config
    └── utils/          # Pose math, helpers
```

### Design Principles
- **High Cohesion**: Related code grouped together
- **Low Coupling**: Features don't depend on each other
- **Service Layer**: External integrations abstracted
- **Custom Hooks**: Business logic in reusable hooks
- **Singleton Pattern**: MediaPipe instance shared globally

## Data Flow

```
User Upload → VideoUploadService → App State (videos array)
                                         ↓
                                   Library Component
                                         ↓
                                   PosePlayer Component
                                         ↓
                                   usePoseDetection Hook
                                         ↓
                                   MediaPipeService (singleton)
                                         ↓
                                   Frame Processing Loop
                                         ↓
                            Pose Landmarks Detected (33 points)
                                         ↓
                            Angle Calculations (lean, slope)
                                         ↓
                            Canvas Drawing (skeleton overlay)
```

## State Management

### App-Level State (`App.jsx`)
```javascript
const [activeTab, setActiveTab] = useState('upload');
const [videos, setVideos] = useState([]);
```

### Video Object Structure
```javascript
{
  id: string,              // Unique identifier
  name: string,            // Filename
  url: string,             // Blob URL for playback
  thumbnail: string,       // Video thumbnail
  isProcessing: boolean,   // Processing state flag
  processingStartTime: number,  // Upload timestamp
  metrics: {
    avgLeanAngle: number,  // Average lean during video
    avgSlopeAngle: number, // Average slope alignment
  }
}
```

## Key Components

### PosePlayer.jsx (Main Video Player)
**Responsibilities**:
- Video playback controls (play/pause, seek, fullscreen)
- Canvas overlay for skeleton drawing
- Real-time angle display
- MediaPipe initialization and lifecycle
- Auto-hide controls during playback

**State**:
- `isPlaying` - Playback status
- `currentTime`, `duration` - Video timeline
- `showControls` - Control visibility
- `leanAngle`, `slopeAngle` - Current pose metrics

**Integration Points**:
- `usePoseDetection` hook for AI processing
- `ResponsiveVideoContainer` for layout
- `VideoControls` for UI buttons

### usePoseDetection.js (Core Detection Hook)
**Responsibilities**:
- Initialize MediaPipe PoseLandmarker
- Start/stop detection loop
- Process video frames
- Calculate angles from landmarks
- Draw skeleton on canvas

**Key Methods**:
- `initializeMediaPipe()` - One-time setup
- `startDetection(video, canvas)` - Begin processing
- `stopDetection()` - Cleanup
- `runDetection()` - RAF loop for frame processing

**Returns**:
```javascript
{
  initializeMediaPipe,
  startDetection,
  stopDetection,
  leanAngle,      // Current lean angle
  slopeAngle,     // Current slope angle
  isReady,        // MediaPipe loaded
  isInitializing  // Loading state
}
```

## Visual System

### Canvas Overlay
- Positioned absolutely over video element
- Transparent background, pointer-events disabled
- Dimensions match video dimensions
- Z-index: 10 (above video, below controls)

### Skeleton Color Coding
- **Light Blue** (rgba(100, 200, 255)): Face connections
- **Green** (rgba(0, 255, 100)): Arms/shoulders
- **Orange** (rgba(255, 150, 0)): Legs/lower body
- **Red** (rgba(255, 50, 50)): Torso/core

### Drawing Process
1. Clear canvas
2. Draw connections (lines between landmarks)
3. Draw landmarks (circles at joint positions)
4. Skip low-confidence points (visibility < 0.3)

## Performance Optimizations

1. **Singleton MediaPipe**: Loaded once, reused for all videos
2. **RAF Loop**: 60fps frame processing using requestAnimationFrame
3. **Visibility Filtering**: Skip drawing low-confidence landmarks
4. **Lazy Initialization**: MediaPipe loads only when needed
5. **Canvas-Only Drawing**: Direct 2D context manipulation (no React re-renders)

## File Reading Priority

### Start Here
1. `App.jsx` - Overall structure and state flow
2. `PosePlayer.jsx` - Main feature implementation
3. `usePoseDetection.js` - AI integration logic
4. `mediapipeService.js` - MediaPipe setup

### Supporting Files
- `poseCalculations.js` - Math utilities
- `Upload.jsx` - Upload UI
- `Library.jsx` - Video grid
- `VideoControls.jsx` - Playback buttons

## Current Limitations

1. **Mock Processing**: Video analysis metrics are simulated (not real)
2. **Client-Side Only**: No backend, no video storage
3. **Single Person**: Detects only one person per frame
4. **2D Angles**: Uses 2D landmarks (3D capabilities unused)
5. **No Persistence**: Videos lost on page refresh

## Potential Extensions

### Short-Term
- Real video analysis (replace mock processing)
- Export angle data to CSV
- Frame-by-frame scrubbing
- Multiple angle metrics (knee, hip, shoulder)

### Long-Term
- Live webcam pose detection
- 3D visualization using world landmarks
- Comparison with professional technique
- Cloud storage and user accounts
- Mobile app version

## Development Commands

```bash
npm start      # Development server (localhost:3000)
npm build      # Production build
npm test       # Run tests
```

## MediaPipe Configuration

**Model**: `public/models/pose_landmarker.task`
**Running Mode**: VIDEO (frame-by-frame)
**Number of Poses**: 1 (single person)
**Min Detection Confidence**: 0.5
**Min Tracking Confidence**: 0.5

## Important Constants

**Reference Vectors** (`shared/constants/mediapipe.js`):
```javascript
VERTICAL: { x: 0, y: -1, z: 0 }  // Perfect vertical
SLOPE: 30° angle                  // Typical skiing slope
```

**Landmark Indices**:
```javascript
POSE_LANDMARKS: {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  // ... 33 total landmarks
}
```

## Debug Features

- Console logs for MediaPipe initialization
- Error handling for failed detection
- Loading indicators during initialization
- Visual feedback for processing state

---

## Quick Summary for LLMs

**What is this app?**
A React web app that analyzes skiing videos using Google's MediaPipe AI to detect body pose, calculate lean and slope angles, and overlay a color-coded skeleton on the video in real-time.

**Main technologies?**
React 18, MediaPipe Tasks Vision (pose detection), Tailwind CSS, HTML5 Canvas

**How does it work?**
User uploads video → MediaPipe detects 33 body landmarks per frame → Math calculates torso angles → Canvas draws skeleton overlay → Real-time angles displayed during playback

**Key files to understand?**
`App.jsx` (state), `PosePlayer.jsx` (UI), `usePoseDetection.js` (AI logic), `mediapipeService.js` (setup)

**Architecture style?**
Feature-based React PoC pattern with service layer abstraction, custom hooks for logic, singleton MediaPipe instance, and canvas-based visualization
