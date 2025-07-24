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
  /**
   * Draw a dynamic outline/border that adapts to the real portrait size (without transparent padding).
   * Useful for Pixel game modes so the outline always hugs the visible image instead of the 256×256 canvas.
   * Default: false
   */
  withOutline?: boolean;
}

const PixelatedImage: React.FC<PixelatedImageProps> = ({
  src,
  alt,
  pixelationLevel,
  fallbackSrc,
  className,
  onLoad,
  onError,
  withOutline = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pixelatedSrc, setPixelatedSrc] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pixelate by drawing to a much smaller canvas and up-scaling back without any blur.
  // Uses discrete block sizes per level to create crisp, blocky mosaic identical to the reference image.
  const pixelateImage = useCallback((image: HTMLImageElement, level: number): string => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        return image.src;
      }

      // Always normalise portrait to a fixed canvas so pixel sizes stay identical no matter original resolution.
      const targetSize = 256;
      canvas.width = targetSize;
      canvas.height = targetSize;

            // Draw the original image fitted inside the square while preserving aspect ratio (letter-box with transparency).
      const iw = image.naturalWidth || image.width;
      const ih = image.naturalHeight || image.height;
      let dw = targetSize;
      let dh = targetSize;
      let dx = 0;
      let dy = 0;
      if (iw > ih) {
        dh = Math.round((ih / iw) * targetSize);
        dy = Math.floor((targetSize - dh) / 2);
      } else if (ih > iw) {
        dw = Math.round((iw / ih) * targetSize);
        dx = Math.floor((targetSize - dw) / 2);
      }
      ctx.drawImage(image, dx, dy, dw, dh);

      // Disable image smoothing for pixelated effect
      ctx.imageSmoothingEnabled = false;
      (ctx as any).webkitImageSmoothingEnabled = false;
      (ctx as any).mozImageSmoothingEnabled = false;
      (ctx as any).msImageSmoothingEnabled = false;

      // Map each pixelation level (0–6) to a block size in original pixels.
      // Uniform list gives consistent large squares across all portraits.
      // Level 0 = 32-px squares (hardest) → Level 6 = 14-px squares (still fairly difficult).
      const blockSizes = [32, 28, 24, 20, 18, 16, 14];
      const blockSize = blockSizes[Math.min(level, blockSizes.length - 1)];

      const smallDim = Math.max(1, Math.floor(targetSize / blockSize));

      // Use an off-screen canvas to avoid progressive sampling artefacts and keep alpha intact
      const tmp = document.createElement('canvas');
      tmp.width = smallDim;
      tmp.height = smallDim;
      const tctx = tmp.getContext('2d');
      if (!tctx) return image.src;
      tctx.imageSmoothingEnabled = false;
      // Downscale full image into tiny canvas
      tctx.drawImage(canvas, 0, 0, targetSize, targetSize, 0, 0, smallDim, smallDim);

      // Clear main canvas before up-scaling
      ctx.clearRect(0, 0, targetSize, targetSize);

      // Draw back without smoothing (crisp)
      ctx.drawImage(tmp, 0, 0, smallDim, smallDim, 0, 0, targetSize, targetSize);

      // Optionally draw outline that hugs the visible portrait, using the original draw region.
      if (withOutline) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'; // Tailwind border-blue-500/60 colour
        ctx.lineWidth = 4;
        ctx.strokeRect(dx + 2, dy + 2, dw - 4, dh - 4); // inset by 2 for neat look
      }

      console.log(`Level: ${level}, Block size: ${blockSize}x${blockSize}`);

      // Export as PNG to preserve transparency (JPEG would replace alpha with white)
      return canvas.toDataURL('image/png');
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