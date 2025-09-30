# RideLvl - Skiing Pose Analysis Application

An intelligent video analysis application that uses MediaPipe's advanced pose detection technology to analyze skiing form and technique in real-time. Built with React and modern web technologies, RideLvl provides instant feedback on body positioning through skeletal visualization and angle measurements.

## 🎿 Overview

RideLvl is a proof-of-concept application designed to help skiers improve their technique by providing visual feedback on their body positioning. The application processes uploaded skiing videos, detects the skier's pose using Google's MediaPipe technology, and calculates key performance metrics such as lean angle and slope angle.

### Key Features
- **Real-time Pose Detection**: Leverages MediaPipe's PoseLandmarker for accurate skeletal tracking
- **Visual Feedback**: Draws colored skeleton overlay on video with joint visualization
- **Angle Calculations**: Measures lean angle (vertical alignment) and slope angle (terrain adaptation)
- **Video Library Management**: Store and review multiple analyzed videos
- **Responsive Design**: Modern UI built with Tailwind CSS for optimal viewing experience

## 🏗 Architecture

The application follows a feature-based architecture designed for React Proof of Concepts (PoCs), emphasizing simplicity, maintainability, and clear separation of concerns.

### Project Structure

```
rideLvl/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Button/           # Custom button component
│   │   ├── Header/           # App header with tab navigation
│   │   └── LoadingCard/      # Loading state display
│   │
│   ├── features/             # Feature-specific modules
│   │   ├── upload/           # Video upload functionality
│   │   │   ├── components/   # Upload UI components
│   │   │   ├── hooks/        # Upload state management
│   │   │   └── services/     # MediaPipe & video processing
│   │   │
│   │   └── library/          # Video library management
│   │       ├── components/   # Library UI (VideoCard, PosePlayer)
│   │       └── hooks/        # Pose detection hooks
│   │
│   ├── shared/               # Shared utilities and constants
│   │   ├── constants/        # MediaPipe configuration
│   │   ├── utils/            # Pose calculations, helpers
│   │   └── types/            # TypeScript-like JSDoc types
│   │
│   └── App.jsx               # Main application component
│
├── public/
│   └── models/               # MediaPipe model files
│       └── pose_landmarker.task
│
└── package.json              # Dependencies and scripts
```

### Architectural Principles

1. **Feature-Based Organization**: Each major feature (upload, library) is self-contained with its own components, hooks, and services
2. **Separation of Concerns**: Clear distinction between UI (components), business logic (hooks), and external integrations (services)
3. **Shared Resources**: Common utilities and constants are centralized in the shared directory
4. **Component Composition**: UI is built using small, reusable components following React best practices
5. **Service Layer Pattern**: External integrations (MediaPipe) are abstracted into service modules

## 🚀 How It Works

### Application Flow

1. **Video Upload Phase**
   - User uploads a skiing video through the Upload interface
   - Video is processed and added to the library in a "processing" state
   - Application automatically switches to the Library tab

2. **Processing Phase**
   - MediaPipe PoseLandmarker is initialized (singleton pattern for efficiency)
   - Video frames are analyzed to detect pose landmarks
   - Performance metrics are calculated from the detected poses
   - Video state is updated with computed metrics

3. **Playback & Analysis Phase**
   - User can play videos with real-time pose overlay
   - Skeleton is drawn on canvas layer above video
   - Lean and slope angles are displayed in real-time
   - Color-coded skeleton helps identify different body parts

### Data Flow Diagram

```
User Upload → VideoUploadService → App State Management
                                          ↓
                                   Library Display
                                          ↓
                              PosePlayer Component
                                          ↓
                              usePoseDetection Hook
                                          ↓
                              MediaPipeService
                                          ↓
                              Pose Calculations
                                          ↓
                              Visual Overlay + Metrics
```

## 🤖 MediaPipe Integration

### What is MediaPipe?

MediaPipe is Google's open-source framework for building multimodal applied ML pipelines. The Pose Landmarker model used in this application can detect 33 body keypoints in 3D space with high accuracy.

### Key Concepts

#### Pose Landmarks
The model detects 33 landmarks representing different body parts:
- **0-10**: Face landmarks (nose, eyes, ears, mouth)
- **11-16**: Upper body (shoulders, elbows, wrists)
- **17-22**: Hands (thumb, pinky, index)
- **23-32**: Lower body (hips, knees, ankles, feet)

#### Landmark Properties
Each landmark contains:
- `x, y`: Normalized coordinates (0-1) relative to image dimensions
- `z`: Depth relative to hip midpoint
- `visibility`: Confidence score (0-1) for landmark detection

### Implementation Details

#### Service Layer (`mediapipeService.js`)
```javascript
// Singleton pattern ensures single instance
let landmarkerPromise = null;

export async function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = createLandmarker();
  }
  return landmarkerPromise;
}
```

Key configuration:
- **Running Mode**: `VIDEO` for frame-by-frame processing
- **Number of Poses**: 1 (single person detection)
- **Model**: `pose_landmarker.task` (full body model)

#### Pose Detection Hook (`usePoseDetection.js`)
Manages the detection lifecycle:
1. Initializes MediaPipe when video plays
2. Processes frames using `requestAnimationFrame` for smooth performance
3. Calculates angles from detected landmarks
4. Draws skeleton overlay on canvas
5. Cleans up resources when video stops

#### Angle Calculations (`poseCalculations.js`)
Mathematical utilities for pose analysis:

**Torso Vector**: Calculated from shoulder and hip midpoints
```javascript
shoulders_midpoint = (left_shoulder + right_shoulder) / 2
hips_midpoint = (left_hip + right_hip) / 2
torso_vector = shoulders_midpoint - hips_midpoint
```

**Lean Angle**: Angle between torso and vertical axis (forward/backward lean)
**Slope Angle**: Angle between torso and slope reference (terrain adaptation)

### Visualization System

The skeleton overlay uses color coding for clarity:
- **Light Blue**: Face connections
- **Green**: Arms and upper body
- **Orange**: Legs and lower body
- **Red**: Torso and core connections

Each joint is rendered as a filled circle with a white outline for visibility against any background.

## 🎯 Performance Optimizations

1. **Singleton Landmarker**: MediaPipe model is loaded once and reused
2. **RequestAnimationFrame**: Smooth 60fps pose detection
3. **Visibility Thresholding**: Low-confidence landmarks are filtered (< 0.3)
4. **Canvas Optimization**: Direct 2D context manipulation for minimal overhead
5. **Lazy Loading**: MediaPipe only initializes when needed

## 🛠 Technical Stack

### Core Technologies
- **React 18.2**: Component-based UI framework
- **MediaPipe Tasks Vision 0.10.8**: Pose detection engine
- **Tailwind CSS 3.3**: Utility-first CSS framework

### Development Tools
- **Create React App**: Build configuration and development server
- **PostCSS & Autoprefixer**: CSS processing and compatibility
- **clsx & tailwind-merge**: Dynamic className utilities

## 📚 Code Reading Guide

### Starting Points

1. **Main Application Flow**: Start with `App.jsx` to understand the high-level structure
2. **Feature Implementation**: Explore `features/upload/` and `features/library/` for domain logic
3. **MediaPipe Integration**: Study `mediapipeService.js` and `usePoseDetection.js`
4. **UI Components**: Review components in `components/` and feature-specific components

### Key Files to Understand

| File | Purpose | Key Concepts |
|------|---------|--------------|
| `App.jsx` | Application orchestration | State management, tab navigation |
| `mediapipeService.js` | MediaPipe initialization | Singleton pattern, async loading |
| `usePoseDetection.js` | Pose detection logic | React hooks, canvas drawing, RAF |
| `poseCalculations.js` | Math utilities | Vector math, angle calculations |
| `PosePlayer.jsx` | Video player with overlay | Canvas layering, event handling |

### Understanding the Data Flow

1. **State Management**: Application state flows top-down from App.jsx
2. **Service Layer**: External integrations are abstracted in service modules
3. **Hook Pattern**: Business logic is encapsulated in custom hooks
4. **Component Composition**: UI is built from small, focused components

## 🚦 Getting Started

### Prerequisites
- Node.js 14+ and npm/yarn
- Modern web browser with WebGL support
- Webcam (optional, for future live detection features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rideLvl.git
cd rideLvl
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Upload a Video**: Click the Upload tab and select a skiing video
2. **Wait for Processing**: The app will analyze the video and extract metrics
3. **Review in Library**: Videos appear in the Library with pose analysis
4. **Play with Overlay**: Click play to see real-time skeleton tracking and angles

## 🔍 Understanding MediaPipe Output

### Landmark Visibility
- **High (> 0.7)**: Landmark is clearly visible and reliable
- **Medium (0.3-0.7)**: Landmark is partially visible, use with caution
- **Low (< 0.3)**: Landmark is occluded or uncertain, filtered from display

### Angle Interpretations
- **Lean Angle**:
  - 0° = Perfect vertical alignment
  - Positive = Forward lean
  - Negative = Backward lean

- **Slope Angle**:
  - Measures adaptation to terrain
  - Optimal range varies by skiing style and conditions

### 3D Capabilities
While the current implementation uses 2D landmarks for display, MediaPipe provides 3D world coordinates that could be used for:
- True 3D angle calculations
- Depth-aware pose analysis
- Advanced biomechanical measurements

## 🎨 UI/UX Design

### Component Library
- Custom Button component with Tailwind styling
- Loading states with skeleton cards
- Responsive grid layouts for video library
- Tab-based navigation for clear user flow

### Visual Design Principles
- Clean, modern interface with subtle shadows and rounded corners
- High contrast overlays for readability
- Color-coded skeleton for intuitive understanding
- Real-time feedback with minimal latency

## 🔮 Future Enhancements

### Planned Features
- [ ] Live webcam pose detection
- [ ] Advanced metrics (knee angles, hip rotation)
- [ ] Performance history and progress tracking
- [ ] Comparison with professional skier poses
- [ ] Export analysis reports
- [ ] Mobile app version

### Technical Improvements
- [ ] 3D visualization using world landmarks
- [ ] WebWorker integration for processing
- [ ] Video annotation and frame-by-frame analysis
- [ ] Cloud storage integration
- [ ] Multi-person detection support

## 📖 Learning Resources

### MediaPipe Documentation
- [MediaPipe Pose Documentation](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- [Pose Landmark Model](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker#models)
- [JavaScript API Reference](https://developers.google.com/mediapipe/api/solutions/js/tasks-vision)

### React Patterns
- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Canvas with React](https://react.dev/learn/manipulating-the-dom-with-refs)

## 🤝 Contributing

This is a proof-of-concept application designed for learning and experimentation. Contributions are welcome!

### Areas for Contribution
- Performance optimizations
- Additional pose metrics
- UI/UX improvements
- Documentation enhancements
- Test coverage

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Google MediaPipe team for the amazing pose detection technology
- React community for the excellent documentation and patterns
- Tailwind CSS for the utility-first CSS framework

---

*Built with ❄️ for the skiing community*