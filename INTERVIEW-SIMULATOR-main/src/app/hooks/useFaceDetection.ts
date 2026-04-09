import { useState, useRef, useCallback, useEffect } from 'react';

interface FaceDetectionResult {
  eyeContact: number;
  faceDetected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseFaceDetectionReturn extends FaceDetectionResult {
  startDetection: (videoElement: HTMLVideoElement) => void;
  stopDetection: () => void;
  isDetecting: boolean;
}

export function useFaceDetection(): UseFaceDetectionReturn {
  const [eyeContact, setEyeContact] = useState(50);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const noFaceCountRef = useRef(0);
  const frameCountRef = useRef(0);

  const detectFace = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number): { hasFace: boolean; faceArea: number } => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Check center region (where face should be)
    const centerX = width / 2;
    const centerY = height / 2;
    const checkWidth = width * 0.6;
    const checkHeight = height * 0.5;
    
    let skinPixels = 0;
    let totalPixels = 0;
    let brightPixels = 0;
    
    const step = 8;
    
    for (let y = Math.floor(centerY - checkHeight / 2); y < Math.floor(centerY + checkHeight / 2); y += step) {
      for (let x = Math.floor(centerX - checkWidth / 2); x < Math.floor(centerX + checkWidth / 2); x += step) {
        if (y < 0 || y >= height || x < 0 || x >= width) continue;
        
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const brightness = (r + g + b) / 3;
        
        // More lenient skin detection
        const isSkin = r > 70 && g > 35 && b > 20 &&
          r > g * 0.9 && r > b * 0.9 &&
          Math.abs(r - g) > 10 &&
          brightness > 40 && brightness < 240;
        
        if (isSkin) {
          skinPixels++;
        }
        if (brightness > 30 && brightness < 250) {
          brightPixels++;
        }
        totalPixels++;
      }
    }
    
    const skinRatio = skinPixels / (totalPixels / (step * step)) * 100;
    const faceArea = skinRatio;
    
    // More lenient face detection
    // Face typically takes 5-40% of central region
    const hasFace = skinRatio > 3 && skinRatio < 50;
    
    return { hasFace, faceArea: skinRatio };
  }, []);

  const calculateEyeContact = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, hasFace: boolean): number => {
    if (!hasFace) return 0;
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    const centerX = width / 2;
    const centerY = height * 0.4;
    
    // Check upper part of face (where eyes usually are)
    let leftRegionDark = 0;
    let rightRegionDark = 0;
    let leftCount = 0;
    let rightCount = 0;
    
    const regionSize = Math.floor(width * 0.12);
    const startY = Math.floor(centerY - height * 0.15);
    const endY = Math.floor(centerY + height * 0.1);
    
    for (let y = startY; y < endY; y += 2) {
      for (let x = Math.floor(centerX - regionSize); x < centerX; x += 2) {
        if (y < 0 || y >= height || x < 0 || x >= width) continue;
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        leftRegionDark += (255 - brightness);
        leftCount++;
      }
      
      for (let x = Math.floor(centerX); x < centerX + regionSize; x += 2) {
        if (y < 0 || y >= height || x < 0 || x >= width) continue;
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        rightRegionDark += (255 - brightness);
        rightCount++;
      }
    }
    
    const avgLeft = leftCount > 0 ? leftRegionDark / leftCount : 0;
    const avgRight = rightCount > 0 ? rightRegionDark / rightCount : 0;
    
    // Eyes typically create darker regions
    const hasEyeFeatures = avgLeft > 15 && avgRight > 15;
    
    if (!hasEyeFeatures) {
      // Eyes might be looking at camera or closed
      // Give moderate score since face is detected
      return 60;
    }
    
    // Symmetric eyes = looking at camera
    const symmetry = 1 - Math.abs(avgLeft - avgRight) / 255;
    const score = 50 + (symmetry * 50);
    
    return Math.round(Math.min(95, Math.max(30, score)));
  }, []);

  const startDetection = useCallback(async (videoElement: HTMLVideoElement) => {
    setIsLoading(true);
    setError(null);
    noFaceCountRef.current = 0;
    frameCountRef.current = 0;

    const waitForVideo = (): Promise<void> => {
      return new Promise((resolve) => {
        if (videoElement.readyState === 4) {
          resolve();
        } else {
          videoElement.onloadedmetadata = () => resolve();
        }
      });
    };

    await waitForVideo();
    setIsLoading(false);
    setIsDetecting(true);
    setEyeContact(50);
    setFaceDetected(true);

    detectionIntervalRef.current = setInterval(() => {
      try {
        if (videoElement.readyState !== 4) return;
        
        const vw = videoElement.videoWidth;
        const vh = videoElement.videoHeight;
        
        if (vw === 0 || vh === 0) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = vw;
        canvas.height = vh;
        
        // Draw video frame (mirrored)
        ctx.translate(vw, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoElement, 0, 0, vw, vh);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const { hasFace, faceArea } = detectFace(ctx, vw, vh);
        
        frameCountRef.current++;
        
        if (hasFace) {
          noFaceCountRef.current = 0;
          setFaceDetected(true);
          
          const eyeScore = calculateEyeContact(ctx, vw, vh, hasFace);
          
          // Gradual update for stability
          setEyeContact(prev => {
            if (prev === 0) return eyeScore;
            // 70% old + 30% new for smooth transitions
            return Math.round(prev * 0.7 + eyeScore * 0.3);
          });
          
        } else {
          noFaceCountRef.current++;
          
          // Only show no face after consistent frames
          if (noFaceCountRef.current > 3) {
            setFaceDetected(false);
            setEyeContact(0);
          }
        }
        
      } catch (err) {
        console.error('Detection error:', err);
      }
    }, 300);

  }, [detectFace, calculateEyeContact]);

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsDetecting(false);
    setEyeContact(50);
    setFaceDetected(false);
    noFaceCountRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  return {
    eyeContact,
    faceDetected,
    isLoading,
    error,
    startDetection,
    stopDetection,
    isDetecting,
  };
}
