import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { DEFAULT_PIN, DEFAULT_PORTRAIT, loadImageWithCache, getOptimizedImageSrc } from '@/lib/image-helpers';

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  imageType?: 'pin' | 'portrait' | 'generic';
  lazy?: boolean;
  priority?: boolean;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onLoadError?: (error: Error) => void;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(({
  src,
  alt,
  fallbackSrc,
  imageType = 'generic',
  lazy = true,
  priority = false,
  className,
  onLoadStart,
  onLoadComplete,
  onLoadError,
  ...props
}, ref) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Determine fallback based on image type
  const defaultFallback = imageType === 'pin' ? DEFAULT_PIN : DEFAULT_PORTRAIT;
  const finalFallback = fallbackSrc || defaultFallback;

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const element = imgRef.current;
    if (!element) return;

    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observerRef.current?.disconnect();
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      );

      observerRef.current.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isInView]);

  // Load image when in view
  useEffect(() => {
    if (!isInView) return;

    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();

    // Get optimized source with WebP support
    const optimizedSrc = getOptimizedImageSrc(src);
    
    // Use cached loading for better performance
    loadImageWithCache(optimizedSrc)
      .then(() => {
        setImgSrc(optimizedSrc);
        setIsLoading(false);
        setHasError(false);
        onLoadComplete?.();
      })
      .catch((error) => {
        // Try fallback
        if (optimizedSrc !== finalFallback) {
          loadImageWithCache(finalFallback)
            .then(() => {
              setImgSrc(finalFallback);
              setIsLoading(false);
              setHasError(false);
              onLoadComplete?.();
            })
            .catch((fallbackError) => {
              setHasError(true);
              setIsLoading(false);
              onLoadError?.(fallbackError);
            });
        } else {
          setHasError(true);
          setIsLoading(false);
          onLoadError?.(error);
        }
      });
  }, [src, isInView, finalFallback, onLoadStart, onLoadComplete, onLoadError]);

  // Don't render anything if not in view and lazy loading
  if (!isInView && lazy && !priority) {
    return (
      <div
        ref={imgRef}
        className={cn("bg-gray-200 animate-pulse", className)}
        style={{ aspectRatio: '1' }}
        {...props}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse",
          "bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]",
          className
        )}
        style={{ aspectRatio: '1' }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={cn(
          "bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center",
          className
        )}
        style={{ aspectRatio: '1' }}
      >
        <span className="text-gray-400 text-xs">Failed to load</span>
      </div>
    );
  }

  return (
    <img
      ref={ref || imgRef}
      src={imgSrc}
      alt={alt}
      className={cn(
        "transition-opacity duration-300 opacity-100",
        className
      )}
      loading={priority ? "eager" : "lazy"}
      {...props}
    />
  );
});

Image.displayName = "Image";

export default Image;
