
import React from 'react';
import { DEFAULT_PORTRAIT } from '@/lib/image-helpers';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt = "Image", 
  fallbackSrc = DEFAULT_PORTRAIT,
  className = "",
  objectFit = "cover",
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
      className={`${className} object-${objectFit}`}
      loading="lazy"
      {...props}
    />
  );
};

export default Image;
