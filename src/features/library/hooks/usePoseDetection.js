import { useRef, useCallback, useEffect, useState } from 'react';
import { getLandmarker } from '../../upload/services/mediapipeService';
import {
  torsoVector,
  angleBetween,
  getPoseConnections
} from '../../../shared/utils/poseCalculations';
import { REFERENCE_VECTORS } from '../../../shared/constants/mediapipe';

export function usePoseDetection() {
  const rafRef = useRef(null);
  const [leanAngle, setLeanAngle] = useState(null);
  const [slopeAngle, setSlopeAngle] = useState(null);

  // Draw pose landmarks and connections on canvas
  const drawPose = useCallback((ctx, width, height, landmarks) => {
    ctx.clearRect(0, 0, width, height);

    if (!landmarks?.length) return;

    const connections = getPoseConnections();

    // Draw connections (skeleton lines)
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const [a, b] of connections) {
      const pointA = landmarks[a];
      const pointB = landmarks[b];

      if (!pointA || !pointB) continue;
      if (pointA.visibility < 0.3 || pointB.visibility < 0.3) continue; // Skip low confidence points

      ctx.beginPath();

      // Different colors for different body parts
      if (a <= 10 && b <= 10) {
        // Face connections - light blue
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
      } else if ((a >= 11 && a <= 16) || (b >= 11 && b <= 16)) {
        // Arms - green
        ctx.strokeStyle = 'rgba(0, 255, 100, 0.8)';
      } else if ((a >= 23 && a <= 32) || (b >= 23 && b <= 32)) {
        // Legs - orange
        ctx.strokeStyle = 'rgba(255, 150, 0, 0.8)';
      } else {
        // Torso and others - red
        ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
      }

      ctx.moveTo(pointA.x * width, pointA.y * height);
      ctx.lineTo(pointB.x * width, pointB.y * height);
      ctx.stroke();
    }

    // Draw landmarks (joints)
    for (let i = 0; i < landmarks.length; i++) {
      const point = landmarks[i];
      if (point.visibility < 0.3) continue; // Skip low confidence points

      ctx.beginPath();

      // Different colors for different landmarks
      if (i <= 10) {
        // Face landmarks - light blue
        ctx.fillStyle = 'rgba(100, 200, 255, 1)';
      } else if (i >= 11 && i <= 16) {
        // Upper body - green
        ctx.fillStyle = 'rgba(0, 255, 100, 1)';
      } else if (i >= 23 && i <= 32) {
        // Lower body - orange
        ctx.fillStyle = 'rgba(255, 150, 0, 1)';
      } else {
        // Others - red
        ctx.fillStyle = 'rgba(255, 50, 50, 1)';
      }

      // Draw white outline for better visibility
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.arc(point.x * width, point.y * height, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }, []);

  // Main detection loop
  const runDetection = useCallback(async (landmarker, video, canvas) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !video) return;

    // Ensure canvas size matches video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    try {
      // Detect poses
      const result = landmarker.detectForVideo(video, performance.now());
      const landmarks = result?.landmarks?.[0];
      const worldLandmarks = result?.worldLandmarks?.[0]; // 3D coordinates!

      if (landmarks && landmarks.length > 0) {
        console.log('🎯 Pose detected! Landmark count:', landmarks.length);

        // Check if we have 3D data
        if (worldLandmarks) {
          console.log('📊 3D World landmarks available! Could use for true 3D angles');
        }

        // Log visibility of key landmarks for debugging
        const keyLandmarks = [11, 12, 23, 24]; // Shoulders and hips
        const visibilities = keyLandmarks.map(i =>
          `L${i}: ${landmarks[i]?.visibility?.toFixed(2) || 'N/A'}`
        ).join(', ');
        console.log('Key landmark visibilities:', visibilities);

        // Calculate torso vector and angles
        const torso = torsoVector(landmarks);
        if (torso) {
          const leanAngleValue = angleBetween(torso, REFERENCE_VECTORS.VERTICAL);
          const slopeAngleValue = angleBetween(torso, REFERENCE_VECTORS.SLOPE);

          if (leanAngleValue !== null) {
            setLeanAngle(Number(leanAngleValue.toFixed(1)));
          }
          if (slopeAngleValue !== null) {
            setSlopeAngle(Number(slopeAngleValue.toFixed(1)));
          }
        }

        // Draw pose on canvas
        drawPose(ctx, canvas.width, canvas.height, landmarks);
        console.log('✅ Skeleton drawn on canvas');
      } else {
        console.log('⚠️ No pose detected in this frame');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch (error) {
      console.error('❌ Error during pose detection:', error);
    }

    // Schedule next frame
    rafRef.current = requestAnimationFrame(() =>
      runDetection(landmarker, video, canvas)
    );
  }, [drawPose]);

  // Start detection
  const startDetection = useCallback(async (video, canvas) => {
    try {
      console.log('🚀 Starting pose detection for video...');
      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);

      const landmarker = await getLandmarker();
      console.log('✅ Landmarker obtained, starting detection loop...');

      rafRef.current = requestAnimationFrame(() =>
        runDetection(landmarker, video, canvas)
      );
    } catch (error) {
      console.error('❌ Failed to start pose detection:', error);
      console.error('Error details:', error.message, error.stack);
    }
  }, [runDetection]);

  // Stop detection
  const stopDetection = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setLeanAngle(null);
    setSlopeAngle(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    startDetection,
    stopDetection,
    leanAngle,
    slopeAngle,
  };
}