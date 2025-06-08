import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PixelatedImageProps {
  src: string;
  alt: string;
  pixelationLevel: number; // 0 = no pixelation, 1-6 = increasing pixelation
  fallbackSrc?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const PixelatedImage: React.FC<PixelatedImageProps> = ({
  src,
  alt,
  pixelationLevel,
  fallbackSrc,
  className,
  onLoad,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pixelatedSrc, setPixelatedSrc] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fast pixelation using simple downscale-upscale technique with blur
  const pixelateImage = useCallback((image: HTMLImageElement, level: number): string => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        return image.src;
      }

      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      
      canvas.width = width;
      canvas.height = height;

      // Disable image smoothing for pixelated effect
      ctx.imageSmoothingEnabled = false;
      (ctx as any).webkitImageSmoothingEnabled = false;
      (ctx as any).mozImageSmoothingEnabled = false;
      (ctx as any).msImageSmoothingEnabled = false;

      // Calculate pixelation and blur factors
      // Starting intensity: 20x pixelation (reduced from 25)
      // Only reduce by 30% over 6 guesses, then stop
      const startingPixelationFactor = 20; // Reduced from 25 for more moderate pixelation
      const maxReduction = 0.3; // 30% reduction
      const reductionPerLevel = maxReduction / 6; // Very small reduction per guess
      
      // Calculate current reduction (caps at 30% after 6 guesses)
      const currentReduction = Math.min(level * reductionPerLevel, maxReduction);
      const pixelationFactor = startingPixelationFactor * (1 - currentReduction);
      
      // Blur effect that also reduces gradually
      const startingBlur = 2.5; // Keep blur the same as before
      const blurReduction = startingBlur * currentReduction; // Blur reduces proportionally
      const currentBlur = Math.max(0, startingBlur - blurReduction);
      
      console.log(`Level: ${level}, Pixelation: ${pixelationFactor.toFixed(1)}, Blur: ${currentBlur.toFixed(1)}, Reduction: ${(currentReduction * 100).toFixed(1)}%`);
      
      const smallWidth = Math.max(1, Math.floor(width / pixelationFactor));
      const smallHeight = Math.max(1, Math.floor(height / pixelationFactor));

      // Apply blur filter if needed
      if (currentBlur > 0) {
        ctx.filter = `blur(${currentBlur}px)`;
      }

      // Step 1: Draw image at small size (downscale)
      ctx.drawImage(image, 0, 0, smallWidth, smallHeight);

      // Reset filter for upscale
      ctx.filter = 'none';

      // Step 2: Draw the small image back at full size (upscale)
      ctx.drawImage(canvas, 0, 0, smallWidth, smallHeight, 0, 0, width, height);

      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
      console.error('Error pixelating image:', error);
      return image.src;
    }
  }, []);

  // Process image when src or pixelation level changes
  useEffect(() => {
    if (!src) return;

    setIsProcessing(true);
    setError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const handleLoad = () => {
      try {
        const result = pixelateImage(img, pixelationLevel);
        setPixelatedSrc(result);
        setImageLoaded(true);
        setIsProcessing(false);
        onLoad?.();
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Failed to process image');
        setIsProcessing(false);
        onError?.();
      }
    };

    const handleError = () => {
      console.error('Error loading image:', src);
      if (fallbackSrc && fallbackSrc !== src) {
        img.src = fallbackSrc;
      } else {
        setError('Failed to load image');
        setIsProcessing(false);
        onError?.();
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;
    imageRef.current = img;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, pixelationLevel, fallbackSrc, pixelateImage, onLoad, onError]);

  if (error && !pixelatedSrc) {
    return (
      <div className={cn(
        "relative overflow-hidden flex items-center justify-center bg-slate-800/50",
        className
      )}>
        <div className="text-center space-y-2 p-4">
          <div className="text-red-400 text-sm">Failed to load image</div>
          <div className="text-white/50 text-xs">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden flex items-center justify-center bg-slate-800/50",
        className
      )}
    >
      {/* Display the pixelated image */}
      {pixelatedSrc && !isProcessing ? (
        <img
          src={pixelatedSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300 pixelated-rendering",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            imageRendering: 'pixelated',
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.error('Error displaying pixelated image');
            setError('Failed to display image');
            onError?.();
          }}
        />
      ) : (
        /* Loading state */
        <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
          <div className="animate-spin h-8 w-8 border-4 border-brawl-yellow border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {/* Loading overlay for processing */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/75">
          <div className="text-center space-y-2">
            <div className="animate-spin h-6 w-6 border-4 border-brawl-yellow border-t-transparent rounded-full mx-auto"></div>
            <p className="text-white/70 text-sm">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PixelatedImage; 