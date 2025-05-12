
import React, { useState } from 'react';
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
  
  const handleError = () => {
    console.log(`Image failed to load: ${src}`);
    
    if (imageSrc !== fallbackSrc) {
      console.log(`Using fallback: ${fallbackSrc}`);
      setImageSrc(fallbackSrc);
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
