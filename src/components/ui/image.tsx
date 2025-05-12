
import React from 'react';
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
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Missing image:", src);
    if (fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
      {...props}
    />
  );
};

export default Image;
