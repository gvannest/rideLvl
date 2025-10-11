import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * ResponsiveVideoContainer
 *
 * A responsive video container that maintains optimal aspect ratios across devices.
 * Implements Step 1.1 of the Mobile Optimization Plan.
 *
 * Features:
 * - Maintains 16:9 aspect ratio
 * - Adapts to viewport size and orientation
 * - Optimal height constraints for mobile (40% portrait, 70% landscape)
 * - Smooth transitions between orientations
 * - Accessibility features (ARIA labels, keyboard navigation)
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Video element and overlays
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onResize - Callback when container resizes
 */
const ResponsiveVideoContainer = ({
  children,
  className = '',
  onResize
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    aspectRatio: '16 / 9'
  });
  const [orientation, setOrientation] = useState({
    isLandscape: false,
    isMobile: false
  });

  // Memoize the resize callback to prevent infinite loops
  const handleResize = useCallback((newDimensions, orientationInfo) => {
    if (onResize) {
      onResize(newDimensions, orientationInfo);
    }
  }, [onResize]);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isMobile = viewportWidth < 768;
      const isLandscape = viewportWidth > viewportHeight;

      // Update orientation state
      setOrientation((prev) => {
        if (prev.isLandscape === isLandscape && prev.isMobile === isMobile) {
          return prev;
        }
        return { isLandscape, isMobile };
      });

      // Calculate optimal dimensions based on device and orientation
      let targetHeight, maxWidth;

      if (isMobile && isLandscape) {
        // Landscape mobile: prioritize 70% of viewport height
        targetHeight = viewportHeight * 0.7;
        maxWidth = viewportWidth - 32; // 16px padding on each side
      } else if (isMobile) {
        // Portrait mobile: prioritize 40% of viewport height
        targetHeight = viewportHeight * 0.4;
        maxWidth = viewportWidth - 32; // 16px padding on each side
      } else {
        // Desktop: use available space with constraints
        targetHeight = viewportHeight * 0.75;
        maxWidth = Math.min(viewportWidth - 64, 1200); // Max 1200px
      }

      // Calculate dimensions maintaining 16:9 aspect ratio
      // Start with target height and calculate width
      let finalWidth = (targetHeight / 9) * 16;
      let finalHeight = targetHeight;

      // If calculated width exceeds max width, recalculate based on width
      if (finalWidth > maxWidth) {
        finalWidth = maxWidth;
        finalHeight = (finalWidth / 16) * 9;
      }

      const newDimensions = {
        width: finalWidth,
        height: finalHeight,
        aspectRatio: '16 / 9'
      };

      setDimensions((prev) => {
        if (prev.width === newDimensions.width && prev.height === newDimensions.height) {
          return prev;
        }
        return newDimensions;
      });

      // Notify parent component of resize
      handleResize(newDimensions, { isLandscape, isMobile });
    };

    // Initial calculation
    updateDimensions();

    // Add event listeners
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [handleResize]);

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto overflow-hidden rounded-lg transition-all duration-300 ease-in-out ${className}`}
      style={{
        width: dimensions.width > 0 ? `${dimensions.width}px` : '100%',
        maxWidth: '100%',
        aspectRatio: dimensions.aspectRatio,
        maxHeight: dimensions.height > 0 ? `${dimensions.height}px` : 'none'
      }}
      role="region"
      aria-label="Video player container"
      data-orientation={orientation.isLandscape ? 'landscape' : 'portrait'}
      data-device={orientation.isMobile ? 'mobile' : 'desktop'}
    >
      {children}
    </div>
  );
};

export default ResponsiveVideoContainer;
