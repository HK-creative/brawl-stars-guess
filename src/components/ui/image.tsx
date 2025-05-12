
import React, { useState, useEffect } from 'react';
import { DEFAULT_PORTRAIT, DEFAULT_PIN } from '@/lib/image-helpers';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt, 
  fallbackSrc = DEFAULT_PORTRAIT,
  className = "",
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  
  // Reset error state if src changes
  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      console.error(`Image failed to load: ${imgSrc}, using fallback: ${fallbackSrc}`);
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  // Debug info
  useEffect(() => {
    if (src) {
      console.log(`Rendering image with src: ${src}, alt: ${alt}`);
    }
  }, [src, alt]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
      {...props}
    />
  );
};

export default Image;
