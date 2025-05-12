
import React from 'react';
import { DEFAULT_PORTRAIT } from '@/lib/image-helpers';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  imageType?: 'pin' | 'portrait' | 'default';
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt = "Image", 
  fallbackSrc = DEFAULT_PORTRAIT,
  className = "",
  objectFit = "cover",
  imageType = "default",
  ...props 
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Missing image:", src);
    if (fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
    }
  };

  // Apply specific styling based on image type
  let imageClassName = className;
  
  if (imageType === 'pin') {
    imageClassName = `${className} w-full h-full object-contain`;
  } else if (imageType === 'portrait') {
    imageClassName = `${className} w-full h-full object-cover`;
  } else {
    imageClassName = `${className} object-${objectFit}`;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      className={imageClassName}
      loading="lazy"
      {...props}
    />
  );
};

export default Image;
