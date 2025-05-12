
import React, { useState, useEffect } from 'react';
import { DEFAULT_PORTRAIT } from '@/lib/image-helpers';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt = "Image", 
  fallbackSrc = DEFAULT_PORTRAIT,
  className = "",
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  
  // Reset error state when src changes
  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
  }, [src]);
  
  const handleError = () => {
    console.error(`Image failed to load: ${src}`);
    
    if (!hasError && fallbackSrc && imageSrc !== fallbackSrc) {
      console.log(`Using fallback image: ${fallbackSrc}`);
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
      {...props}
    />
  );
};

export default Image;
