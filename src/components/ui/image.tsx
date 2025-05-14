
import React, { useState, useEffect } from 'react';
import { DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  imageType?: 'pin' | 'portrait' | 'default';
  aspectRatio?: number;
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt = "Image", 
  fallbackSrc = DEFAULT_PORTRAIT,
  className = "",
  objectFit = "cover",
  imageType = "default",
  aspectRatio,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  
  // Reset the image source whenever the src prop changes
  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Missing image:", src);
    setImgSrc(fallbackSrc);
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

  const renderImage = () => (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={imageClassName}
      loading="lazy"
      {...props}
    />
  );

  // If aspectRatio is provided, wrap in AspectRatio component
  if (aspectRatio) {
    return (
      <AspectRatio ratio={aspectRatio} className="overflow-hidden">
        {renderImage()}
      </AspectRatio>
    );
  }

  return renderImage();
};

export default Image;
